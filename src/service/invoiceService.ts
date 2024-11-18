import { Event, PrismaClient, InvoiceStatus, Invoice } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

// type Invoice = {
//   // invoice number is generated by the system
//   invoiceNumber: string;
//   // sent by requester
//   createDate: Date;
//   // sent by requester
//   dueDate: Date;
//   // sent by requester
//   status: InvoiceStatus;
//   // created in backend
//   invoiceFrom: any;
//   // static value which is cult creative
//   invoiceTo: object;
//   // the service item which is static
//   items: object[];
//   // get it from the aggremant form data
//   totalAmount: number;
//   // get all of it from creator data
//   bankInfo: object;
//   // get it from the session
//   createdBy: string;
//   // sent by requester
//   campaignId: string;
// };

export const createInvoiceService = async (data: any, userId: any, amount: any) => {
  const generateRandomInvoiceNumber = () => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `INV-${randomNumber}`;
  };

  const invoiceTo = {
    id: '1',
    name: 'Cult Creative',
    fullAddress:
      '4-402, Level 4, The Starling Mall, Lot 4-401 &, 6, Jalan SS 21/37, Damansara Utama, 47400 Petaling Jaya, Selangor',
    phoneNumber: '+60 11-5415 5751',
    company: 'Cult Creative',
    addressType: 'Hq',
    email: 'support@cultcreative.asia',
    primary: true,
  };

  // get item from aggremant form
  const item = {
    title: 'Posting on social media',
    description: 'posting on social media',
    service: 'Posting on social media',
    quantity: 1,
    price: amount,
    total: amount,
  };

  const invoiceFrom = {
    id: data.user.id,
    name: data.user.name,
    phoneNumber: data.user.phoneNumber,
    email: data.user.email,
    fullAddress: data.user.creator.fullAddress,
    company: data.user.creator.employment,
    addressType: 'Home',
    primary: false,
  };

  const bankInfo = {
    bankName: data.user.paymentForm.bankName,
    payTo: data.user.name,
    accountNumber: data.user.paymentForm.bankAccountNumber,
    accountEmail: data.user.email,
  };

  try {
    // const newInvoice: Invoice = await prisma.invoice.create({
    //   data: {
    //     invoiceNumber: generateRandomInvoiceNumber(),
    //     createdAt: data.updatedAt,
    //     dueDate: new Date(dayjs(data.updatedAt).add(15, 'day').format()),
    //     status: 'draft' as InvoiceStatus,
    //     invoiceFrom: invoiceFrom,
    //     invoiceTo,
    //     task: item,
    //     amount: parseFloat(amount) || 0,
    //     bankAcc: bankInfo,
    //     creatorId: data.userId,
    //     createdBy: userId as string,
    //   },
    // });

    const { invoice } = await prisma.campaign.update({
      where: {
        id: data.campaignId,
      },
      data: {
        invoice: {
          create: {
            invoiceNumber: generateRandomInvoiceNumber(),
            createdAt: data.updatedAt,
            dueDate: new Date(dayjs(data.updatedAt).add(15, 'day').format()),
            status: 'draft' as InvoiceStatus,
            invoiceFrom: invoiceFrom,
            invoiceTo,
            task: item,
            amount: parseFloat(amount) || 0,
            bankAcc: bankInfo,
            createdBy: userId,
            creator: {
              connect: {
                userId: data.userId,
              },
            },
          },
        },
      },
      include: {
        invoice: true,
      },
    });

    return invoice.find((item) => item.creatorId === data.user.id);
  } catch (error) {
    throw new Error(error);
  }
};
