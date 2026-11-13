import { consumer, producer, connectProducer } from '../../config/kafka.js';
import logger from '../../config/logger.js';
import { KAFKA_TOPICS } from '../../../../shared/constants/kafka-topics.js';
import { withDLQ } from '../../../../shared/utils/dlqHandler.js';
import inventoryService from '../../services/inventory.service.js';

class InventoryConsumer {
     async start() {
          await consumer.connect();
          await connectProducer(); // needed for DLQ publishing
          logger.info('Inventory consumer connected');

          await consumer.subscribe({
               topics: [
                    KAFKA_TOPICS.SCHEDULE_CREATED,
                    KAFKA_TOPICS.SCHEDULE_CANCELLED,
               ],
               fromBeginning: true,
          });

          await consumer.run({
               eachMessage: withDLQ(producer, KAFKA_TOPICS.DLQ_INVENTORY, logger, async ({ topic, partition, message, parsedValue }) => {
                    logger.info(`Processing ${topic}`, {
                         partition,
                         offset: message.offset,
                    });

                    switch (topic) {
                         case KAFKA_TOPICS.SCHEDULE_CREATED:
                              await inventoryService.initializeInventory(parsedValue);
                              break;

                         case KAFKA_TOPICS.SCHEDULE_CANCELLED:
                              await inventoryService.cancelScheduleInventory(parsedValue);
                              break;

                         default:
                              logger.warn(`Unhandled topic: ${topic}`);
                    }
               }),
          });

          logger.info('Inventory consumer running...');
     }
}

export default new InventoryConsumer();
