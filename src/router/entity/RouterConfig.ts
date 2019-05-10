import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RouterConfig {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  platformChannel: string;

  @Column()
  herokuChannel: string;

  @Column()
  isActive: boolean;
}
