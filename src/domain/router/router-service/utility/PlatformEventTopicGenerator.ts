import { Service } from 'typedi';

@Service()
export class PlatformEventTopicGenerator {
  public generateTopic(topicName: string): string {
    return `/event/${topicName}`;
  }
}
