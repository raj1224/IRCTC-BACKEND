import { consumer, connectProducer } from '../../config/kafka.js';
import emailService from '../../services/email.service.js';
import logger from '../../config/logger.js';
import { KAFKA_TOPICS } from '../../../../shared/constants/kafka-topics.js';
import { withDLQ } from '../../../../shared/utils/dlqHandler.js';

class EmailConsumer {
     async start() {
          try {
               await consumer.connect();
               // await connectProducer(); // needed for DLQ publishing
               logger.info('Email consumer connected to Kafka');

               await consumer.subscribe({
                    topics: Object.values(KAFKA_TOPICS),
                    fromBeginning: false
               });

               // await consumer.run({
               //      eachMessage: withDLQ(producer, KAFKA_TOPICS.DLQ_NOTIFICATION, logger, async ({ topic, parsedValue }) => {
               //           logger.info(`Processing message from topic: ${topic}`);
               //           await this.handleMessage(topic, parsedValue);
               //      }),
               // });
               
await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
        try {
            logger.info(`Processing message from topic: ${topic}`);

            // Kafka message buffer ko string mein convert karo
            const rawValue = message.value?.toString();

            if (!rawValue) {
                throw new Error("Kafka message value is empty");
            }

            // JSON string ko JavaScript object mein convert karo
            const parsedValue = JSON.parse(rawValue);

            logger.info("Kafka message received", {
                topic,
                partition,
                offset: message.offset,
            });

            await this.handleMessage(topic, parsedValue);

        } catch (error) {
            logger.error("Failed to process Kafka message", {
                topic,
                partition,
                offset: message.offset,
                error: error.message,
                stack: error.stack,
            });

            throw error;
        }
    },
});


               logger.info('Email consumer is running and listening for messages...');
          } catch (error) {
               logger.error("Failed to start email consumer", {
        message: error.message,
        stack: error.stack,
        name: error.name,
    });
               throw error;
          }
     }

     async handleMessage(topic, data) {
          switch (topic) {
               case KAFKA_TOPICS.OTP_EMAIL:
                    await this.handleOtpEmail(data);
                    break;

               case KAFKA_TOPICS.WELCOME_EMAIL:
                    await this.handleWelcomeEmail(data);
                    break;

               case KAFKA_TOPICS.BOOKING_CONFIRMED:
                    await this.handleBookingConfirmed(data);
                    break;

               case KAFKA_TOPICS.BOOKING_FAILED:
                    await this.handleBookingFailed(data);
                    break;

               case KAFKA_TOPICS.BOOKING_CANCELLED:
                    await this.handleBookingCancelled(data);
                    break;

               default:
                    logger.warn(`Unknown topic: ${topic}`);
          }
     }

     async handleOtpEmail(data) {
          const { email, otp, ttlMinutes } = data;

          if (!email || !otp) {
               throw new Error('Missing required fields: email or otp');
          }

          await emailService.sendOtpEmail(email, otp, ttlMinutes || 5);
          logger.info(`OTP email sent to ${email}`);
     }

     async handleWelcomeEmail(data) {
          const { email, firstName } = data;

          if (!email || !firstName) {
               throw new Error('Missing required fields: email or firstName');
          }

          await emailService.sendWelcomeEmail(email, firstName);
          logger.info(`Welcome email sent to ${email}`);
     }

     async handleBookingConfirmed(data) {
          const { email, bookingId } = data;

          if (!email) {
               logger.warn(`Skipping booking-confirmed email — no email on event`, { bookingId });
               return;
          }

          await emailService.sendBookingConfirmedEmail(email, data);
          logger.info(`Booking confirmed email sent to ${email}`, { bookingId });
     }

     async handleBookingFailed(data) {
          const { email, bookingId } = data;

          if (!email) {
               logger.warn(`Skipping booking-failed email — no email on event`, { bookingId });
               return;
          }

          await emailService.sendBookingFailedEmail(email, data);
          logger.info(`Booking failed email sent to ${email}`, { bookingId });
     }

     async handleBookingCancelled(data) {
          const { email, bookingId } = data;

          if (!email) {
               logger.warn(`Skipping booking-cancelled email — no email on event`, { bookingId });
               return;
          }

          await emailService.sendBookingCancelledEmail(email, data);
          logger.info(`Booking cancelled email sent to ${email}`, { bookingId });
     }

     async stop() {
          await consumer.disconnect();
          logger.info('Email consumer disconnected');
     }
}

export default new EmailConsumer();
