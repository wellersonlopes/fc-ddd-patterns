import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  
  async update(entity: Order): Promise<void> {

    await OrderModel.destroy(
      {
        where: {
          id: entity.id,
        },        
      });

    await this.create(entity);
  }
  
  async find(id: string): Promise<Order> {
    let orderModel;
    try {
      orderModel = await OrderModel.findOne({
        where: {
          id,
        },
        include: [{ model: OrderItemModel }],
      });
    } catch (error) {
      throw new Error("Order not found");
    }

    return new Order(id, orderModel.customer_id, orderModel.items.map( item => 
      new OrderItem(item.id, item.name, item.price/item.quantity, item.product_id, item.quantity)
    ));

  }
  
  async findAll(): Promise<Order[]> {
    const orderModel = await OrderModel.findAll({
      include: [{ model: OrderItemModel }],
    });

    return orderModel.map((order) => 
      new Order(order.id, order.customer_id, order.items.map( item => 
         new OrderItem(item.id, item.name, item.price/item.quantity, item.product_id, item.quantity)
      ))
    );
  }

  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }
}
