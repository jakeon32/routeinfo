import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Route } from "./Route";

@Entity("schedules")
export class Schedule {
    @PrimaryGeneratedColumn({ name: "schedule_id" })
    scheduleId!: number;

    @Column({ name: "route_id" })
    routeId!: number;

    @Column({ name: "start_date", type: "date" })
    startDate!: string;

    @Column({ name: "end_date", type: "date" })
    endDate!: string;

    @Column({ name: "schedule_type", type: "varchar", length: 20 })
    scheduleType!: "REGULAR" | "ONCE";

    @Column({ name: "days_of_week", type: "varchar", length: 20, nullable: true })
    daysOfWeek?: string;

    @Column({ name: "is_active", type: "boolean", default: true })
    isActive!: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

    @ManyToOne(() => Route)
    @JoinColumn({ name: "route_id" })
    route!: Route;
}
