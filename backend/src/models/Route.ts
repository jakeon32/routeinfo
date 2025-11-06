import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { RouteAttribute } from "./RouteAttribute";
import { RouteStop } from "./RouteStop";

@Entity("routes")
export class Route {
  @PrimaryGeneratedColumn({ name: "route_id" })
  routeId!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ name: "group_name", type: "varchar", length: 100, nullable: true })
  groupName?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  // Relations
  @ManyToMany(() => RouteAttribute)
  @JoinTable({
    name: "route_route_attributes",
    joinColumn: { name: "route_id", referencedColumnName: "routeId" },
    inverseJoinColumn: { name: "attr_id", referencedColumnName: "attrId" }
  })
  attributes!: RouteAttribute[];

  @OneToMany(() => RouteStop, routeStop => routeStop.route)
  routeStops!: RouteStop[];
}
