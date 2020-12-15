

export class SequentiallyRun {

  public Push(task:() => Promise<void>) {
    this.waitingQueue_.push(task);
    this.run().then();
  }

  private async run() {
    if (this.waitingQueue_.length == 0 || this.isRunning) {
      return;
    }

    this.isRunning = true;
    let task = this.waitingQueue_.shift()!
    await task();
    this.isRunning = false;
    // 不需要等待下一个run执行结束
    this.run().then();
  }

  private waitingQueue_:Array<() => Promise<void> > = [];
  private isRunning = false;
}