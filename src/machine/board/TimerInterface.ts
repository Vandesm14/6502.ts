'use strict';

import SchedulerInterface = require('../../tools/scheduler/SchedulerInterface');

interface TimerInterface {

    tick(clocks: number): void;

    start(scheduler: SchedulerInterface, sliceHint?: number): void;

    stop(): void;

    isRunning(): boolean;
}

export = TimerInterface;
