import { Job } from '../decorators/job.decorator';
import { AbstractJob } from './abstract.job';

@Job({
  name: 'fibonacci',
  description: 'generate a Fibonacci sequence and store it in the database',
})
export class FibonacciJob extends AbstractJob {}
