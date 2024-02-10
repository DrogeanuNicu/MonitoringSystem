package threadpool

import (
	"errors"
	"fmt"
	"sync"
)

var (
	workerCount int
	taskQueue   chan func() error
	wg          sync.WaitGroup
	stopCh      chan struct{}
)

func Init(workers int, taskQueueSize int) {
	workerCount = workers
	taskQueue = make(chan func() error, taskQueueSize)
	stopCh = make(chan struct{})

	for i := 0; i < workerCount; i++ {
		wg.Add(1)
		go worker()
	}
}

func Submit(task func() error) error {
	if len(taskQueue) < cap(taskQueue) {
		taskQueue <- task
		return nil
	}
	return errors.New("The task queue is full")
}

func Stop() {
	close(taskQueue)
	wg.Wait()
	close(stopCh)
}

func worker() {
	defer wg.Done()
	for {
		select {
		case task, ok := <-taskQueue:
			if !ok {
				return
			}

			err := task()
			if err != nil {
				fmt.Println(err)
			}

		case <-stopCh:
			return
		}
	}
}
