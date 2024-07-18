import { z } from 'zod'

export const ecowaterDateSchema = z.string().transform((val, ctx) => {
  const dateSplitted = val.split('/')
  if (dateSplitted.length !== 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_date,
      message: 'Invalid date',
    })
    return z.NEVER
  }
  // Ecowater currently doesn't provide timezone, so we're assuming server timezone = station timezone
  const date = new Date()
  const dayParsed = z.coerce.number().min(1).max(31).parse(dateSplitted[0])
  date.setDate(dayParsed)
  const monthParsed =
    z.coerce.number().min(1).max(12).parse(dateSplitted[1]) - 1
  date.setMonth(monthParsed)
  const fullYearParsed = z.coerce.number().parse(dateSplitted[2])
  date.setFullYear(fullYearParsed)
  date.setHours(23, 59, 59, 999)

  return date
})

export const ecowaterNextRechargeIsScheduledSchema = z
  .string()
  .transform((val, ctx) => {
    const nextRechargeRegex = new RegExp(
      /device-info-nextRecharge'\)\.html\('(?:(Not Scheduled|.+))'/gm
    )
    const nextRechargeRegexResults = nextRechargeRegex.exec(val)
    if (!nextRechargeRegexResults || nextRechargeRegexResults.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Returned HTML snipped is invalid',
      })

      return z.NEVER
    }
    return nextRechargeRegexResults[1] !== 'Not Scheduled'
  })

export const ecowaterLastRechargeDateSchema = z
  .string()
  .transform((val, ctx) => {
    const lastRechargeRegex = new RegExp(
      /device-info-lastRecharge'\).html\('(.+)'\)/gm
    )
    const lastRechargeRegexResults = lastRechargeRegex.exec(val)
    if (!lastRechargeRegexResults || lastRechargeRegexResults.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Returned HTML snipped is invalid',
      })

      return z.NEVER
    }
    return ecowaterDateSchema.parse(lastRechargeRegexResults[1])
  })

export const ecowaterDataSchema = z.object({
  online: z.boolean(),
  salt_level: z.number(),
  salt_level_percent: z.number(),
  out_of_salt: ecowaterDateSchema,
  out_of_salt_days: z.number(),
  water_today: z.number(),
  water_avg: z.number(),
  water_avail: z.number(),
  water_units: z.string(),
  water_flow: z.number(),
  time: z.string().transform((val, ctx) => {
    const timeSplitted = val.split(':')
    if (timeSplitted.length !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: 'Invalid date',
      })
      return z.NEVER
    }
    const hour = z.coerce.number().min(0).max(23).parse(timeSplitted[0])
    const minutes = z.coerce.number().min(0).max(59).parse(timeSplitted[1])
    const date = new Date()
    date.setHours(hour, minutes)

    return date
  }),
  rechargeEnabled: z.boolean(),
  /* recharge scheduled */
  recharge: z.string().transform((val, ctx) => {
    const nextRechargeIsScheduled =
      ecowaterNextRechargeIsScheduledSchema.parse(val)
    const lastRechargeDate = ecowaterLastRechargeDateSchema.parse(val)

    return {
      nextRechargeIsScheduled,
      lastRechargeDate,
    }
  }),
})

export type EcoWaterData = z.infer<typeof ecowaterDataSchema>
