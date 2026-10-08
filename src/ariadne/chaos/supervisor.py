"""Worker Task Supervisor and Worker Monkey (Simian Task Reaper).

Oversees long-running background tasks (e.g. streaming buffers, incident generators)
and simulates unexpected task termination (Worker Monkey) to test self-healing loops.
"""
from __future__ import annotations

import asyncio
import logging
import random
import time
from typing import Callable, Coroutine, Dict, Optional

from ariadne.chaos.config import ChaosConfig
from ariadne.chaos.journal import ChaosJournal

logger = logging.getLogger("ariadne.chaos.supervisor")


class SupervisedWorker:
    """Descriptor for a worker managed and respawned by the supervisor."""

    def __init__(self, name: str, factory: Callable[[], Coroutine]) -> None:
        self.name = name
        self.factory = factory
        self.task: Optional[asyncio.Task] = None
        self.restart_count: int = 0
        self.last_killed_at: Optional[float] = None
        self.last_restarted_at: Optional[float] = None


class WorkerSupervisor:
    """Supervises active background tasks and unleashes the Worker Monkey."""

    def __init__(
        self,
        config: ChaosConfig,
        journal: Optional[ChaosJournal] = None,
    ) -> None:
        self.config = config
        self.journal = journal or ChaosJournal()
        self._workers: Dict[str, SupervisedWorker] = {}
        self._reaper_task: Optional[asyncio.Task] = None
        self._running = False

    def register_worker(self, name: str, factory: Callable[[], Coroutine]) -> None:
        """Register a worker factory function to be supervised and auto-restarted."""
        worker = SupervisedWorker(name=name, factory=factory)
        self._workers[name] = worker

    def start_worker(self, name: str) -> asyncio.Task:
        """Spawn an instance of a registered worker with a supervisor wrapper."""
        if name not in self._workers:
            raise KeyError(f"Worker '{name}' not registered in supervisor")

        worker = self._workers[name]

        async def _wrapper():
            while self._running:
                try:
                    coro = worker.factory()
                    await coro
                    break  # Clean exit
                except asyncio.CancelledError:
                    if not self._running:
                        break  # Intentional supervisor shutdown
                    # Worker was struck by Worker Monkey!
                    worker.restart_count += 1
                    worker.last_restarted_at = time.time()
                    if self.config.worker_monkey.auto_recover:
                        logger.warning(
                            f"[WORKER MONKEY] Worker '{name}' terminated by Chaos Monkey. Supervisor auto-respawning..."
                        )
                        # Yield to event loop then respawn
                        await asyncio.sleep(0.05)
                        continue
                    else:
                        break
                except Exception as ex:
                    logger.error(f"[SUPERVISOR] Worker '{name}' failed with {ex}. Restarting in 0.5s...")
                    await asyncio.sleep(0.5)

        try:
            loop = asyncio.get_running_loop()
            task = loop.create_task(_wrapper(), name=f"supervised-{name}")
            worker.task = task
            return task
        except RuntimeError:
            worker.task = None
            return None

    def strike_worker(self, name: str) -> bool:
        """Manually strike and terminate a specific worker for testing."""
        if name not in self._workers:
            return False
        worker = self._workers[name]
        worker.last_killed_at = time.time()
        if worker.task and not worker.task.done():
            worker.task.cancel()
        else:
            worker.restart_count += 1
            worker.last_restarted_at = time.time()

        if self.config.track_journal:
            self.journal.record(
                monkey="worker",
                target=f"worker:{name}",
                impact=f"Terminated background worker task '{name}' mid-execution",
                auto_recovered=self.config.worker_monkey.auto_recover,
            )
        return True

    def strike_random_worker(self) -> Optional[str]:
        """Randomly select a registered worker and strike it."""
        active = [
            name
            for name, w in self._workers.items()
            if w.task is not None and not w.task.done()
        ]
        if not active:
            # Fallback to any registered worker
            active = list(self._workers.keys())
        if not active:
            return None
        target = random.choice(active)
        if self.strike_worker(target):
            return target
        return None

    async def _reaper_loop(self) -> None:
        """Periodic background reaper loop representing the Worker Monkey."""
        while self._running:
            try:
                interval = max(0.5, self.config.worker_monkey.check_interval_seconds)
                await asyncio.sleep(interval)

                if not self.config.enabled or not self.config.worker_monkey.enabled:
                    continue

                if random.random() < self.config.worker_monkey.kill_probability:
                    killed = self.strike_random_worker()
                    if killed:
                        logger.info(f"[SIMIAN REAPER] Worker Monkey struck target '{killed}'")
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"[SIMIAN REAPER] Reaper error: {e}")

    def start(self) -> None:
        """Start the supervisor and spawn all registered workers and the reaper."""
        self._running = True
        try:
            loop = asyncio.get_running_loop()
            for name in self._workers:
                self.start_worker(name)
            if self._reaper_task is None or self._reaper_task.done():
                self._reaper_task = loop.create_task(self._reaper_loop(), name="simian-reaper")
        except RuntimeError:
            # Called synchronously outside an active asyncio event loop
            pass

    def stop(self) -> None:
        """Stop supervisor and cleanly cancel all tasks."""
        self._running = False
        if self._reaper_task and not self._reaper_task.done():
            self._reaper_task.cancel()
        for worker in self._workers.values():
            if worker.task and not worker.task.done():
                worker.task.cancel()

    def get_status(self) -> dict:
        """Return supervisor health metrics and task restart counters."""
        workers_status = {}
        for name, w in self._workers.items():
            workers_status[name] = {
                "active": w.task is not None and not w.task.done(),
                "restart_count": w.restart_count,
                "last_killed_at": w.last_killed_at,
                "last_restarted_at": w.last_restarted_at,
            }
        return {
            "running": self._running,
            "registered_workers": len(self._workers),
            "reaper_active": self._reaper_task is not None and not self._reaper_task.done(),
            "workers": workers_status,
        }
