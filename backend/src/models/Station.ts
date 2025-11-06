import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Stop } from "./Stop";

@Entity("stations")
export class Station {
  @PrimaryGeneratedColumn({ name: "station_id" })
  stationId!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ name: "primary_stop_id", type: "int", nullable: true })
  primaryStopId?: number;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => Stop, stop => stop.station)
  stops!: Stop[];

  @ManyToOne(() => Stop, { nullable: true })
  @JoinColumn({ name: "primary_stop_id" })
  primaryStop?: Stop;
}
