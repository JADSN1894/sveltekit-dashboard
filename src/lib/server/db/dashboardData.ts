import {prisma} from './prisma'

export const fetchAllRevenue = () => prisma.revenue.findMany()

export const fetchLatestInvoices = async () => {
	await delay(1000)

	return prisma.invoice.findMany({include: {customer: true}})
}

export type CardData = {
	amountCollected: number
	amountPending: number
	totalInvoices: number
	totalCustomers: number
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const fetchCardData = async (): Promise<CardData> => {
	const [
		amountCollectedResult,
		amountPendingResult,
		totalInvoices,
		totalCustomers,
	] = await Promise.all([
		prisma.invoice.aggregate({_sum: {amount: true}, where: {status: 'paid'}}),
		prisma.invoice.aggregate({
			_sum: {amount: true},
			where: {status: 'pending'},
		}),
		prisma.invoice.count(),
		prisma.customer.count(),
	])

	await delay(5000)

	return {
		amountCollected: amountCollectedResult._sum.amount || 0,
		amountPending: amountPendingResult._sum.amount || 0,
		totalInvoices,
		totalCustomers,
	}
}
