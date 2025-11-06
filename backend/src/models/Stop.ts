import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Station } from "./Station";

@Entity("stops")
export class Stop {
  @PrimaryGeneratedColumn({ name: "stop_id" })
  stopId!: number;

  @Column({ name: "station_id", type: "int" })
  stationId!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  address?: string;

  @Column({ type: "decimal", precision: 10, scale: 7 })
  latitude!: number;

  @Column({ type: "decimal", precision: 10, scale: 7 })
  longitude!: number;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ name: "photo_url", type: "varchar", length: 255, nullable: true })
  photoUrl?: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Station, station => station.stops)
  @JoinColumn({ name: "station_id" })
  station!: Station;
}
