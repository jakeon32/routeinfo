import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Route } from "./Route";
import { Stop } from "./Stop";

export enum StopPurpose {
  ON = "ON",
  OFF = "OFF",
  ON_OFF = "ON_OFF",
  REF = "REF"
}

@Entity("route_stops")
export class RouteStop {
  @PrimaryGeneratedColumn({ name: "route_stop_id" })
  routeStopId!: number;

  @Column({ name: "route_id", type: "int" })
  routeId!: number;

  @Column({ name: "stop_id", type: "int" })
  stopId!: number;

  @Column({ type: "int" })
  sequence!: number;

  @Column({ name: "travel_time_min", type: "int", nullable: true })
  travelTimeMin?: number;

  @Column({ name: "distance_m", type: "int", nullable: true })
  distanceM?: number;

  @Column({ name: "stop_purpose", type: "enum", enum: StopPurpose })
  stopPurpose!: StopPurpose;

  @Column({ name: "is_blocked", type: "boolean", default: false })
  isBlocked!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Route, route => route.routeStops)
  @JoinColumn({ name: "route_id" })
  route!: Route;

  @ManyToOne(() => Stop)
  @JoinColumn({ name: "stop_id" })
  stop!: Stop;
}
