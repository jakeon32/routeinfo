import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("route_attributes")
export class RouteAttribute {
  @PrimaryGeneratedColumn({ name: "attr_id" })
  attrId!: number;

  @Column({ type: "varchar", length: 50, unique: true })
  name!: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "is_display", type: "boolean", default: true })
  isDisplay!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
