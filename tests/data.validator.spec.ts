import { describe, it, expect } from 'vitest'
import {
  ecowaterDataSchema,
  ecowaterDateSchema,
  ecowaterLastRechargeDateSchema,
  ecowaterNextRechargeIsScheduledSchema,
} from '../src/data.validator'
import { networkInterfaces } from 'os'

describe.only('EcoWater data validator', () => {
  const sample = {
    online: true,
    salt_level: 2,
    salt_level_percent: 40,
    out_of_salt: '25/09/2024',
    out_of_salt_days: 70,
    water_today: 140,
    water_avg: 189,
    water_avail: 427,
    water_units: 'Liters',
    water_flow: 0,
    time: '21:11',
    rechargeEnabled: true,
    recharge:
      '\r\n\r\n\r\n<li class="recharge ">\r\n    <a data-toggle="modal" data-target="#modal-rechargeNow"><img src="/Content/img/icon_refresh.png"/>Recharge Now</a>\r\n</li>\r\n    \r\n<li>\r\n    <script type="text/javascript">\r\n        $(\'#device-info-lastRecharge\').html(\'15/07/2024\');\r\n    </script>\r\n\r\n        <script type="text/javascript">$(\'#device-info-nextRecharge\').html(\'Not Scheduled\');</script>\r\n\r\n        <script type="text/javascript">$(\'#recharge-disabled-message\').addClass(\'hidden\');</script>\r\n\r\n</li>\r\n\r\n<li class="recharge ">\r\n    <a data-toggle="modal" data-target="#modal-rechargeSchedule"><img src="/Content/img/icon_timer.png"/>Schedule Recharge</a>\r\n</li>\r\n\r\n\r\n',
  }

  it('should pass the test', () => {
    ecowaterDataSchema.parse(sample)
    expect(true).toBe(true)
  })

  describe('EcoWater date parser', () => {
    it('should parse date from api to correct date', () => {
      const date = ecowaterDateSchema.parse('25/09/2024')
      expect(date).toBeInstanceOf(Date)
      expect(date.getDate()).toBe(25)
      expect(date.getMonth()).toBe(8)
      expect(date.getFullYear()).toBe(2024)
    })

    it('should throw an error when date is invalid', () => {
      expect(() => ecowaterDateSchema.parse('25/09/2024 12:00')).toThrow()
      expect(() => ecowaterDateSchema.parse('25-09-2024')).toThrow()
    })
  })

  describe('EcoWater last recharge', () => {
    it('should parse last recharge date when it is present', () => {
      const lastRechargeSample =
        "<script type=\"text/javascript\">\r\n        $('#device-info-lastRecharge').html('15/07/2024');\r\n    </script>\r\n\r\n"
      const date = ecowaterLastRechargeDateSchema.parse(lastRechargeSample)
      expect(date).toBeInstanceOf(Date)
      expect(date.getDate()).toBe(15)
      expect(date.getMonth()).toBe(6)
      expect(date.getFullYear()).toBe(2024)
    })

    it('should throw an error when last recharge date is not present', () => {
      const lastRechargeSample =
        "<script type=\"text/javascript\">\r\n        $('#device-info-lastRecharge').html('');\r\n    </script>\r\n\r\n"
      expect(() =>
        ecowaterLastRechargeDateSchema.parse(lastRechargeSample)
      ).toThrow()
    })
  })
  describe('EcoWater next recharge', () => {
    it('should return false when date is not specified', () => {
      const nextRecharge =
        " \r\n\r\n        <script type=\"text/javascript\">$('#device-info-nextRecharge').html('Not Scheduled');</script>\r\n\r\n "
      const nextRechargeIsScheduled =
        ecowaterNextRechargeIsScheduledSchema.parse(nextRecharge)
      expect(nextRechargeIsScheduled).toBe(false)
    })

    it('should return true when date is specified', () => {
      const nextRecharge =
        " \r\n\r\n        <script type=\"text/javascript\">$('#device-info-nextRecharge').html('15/07/2024');</script>\r\n\r\n "
      const nextRechargeIsScheduled =
        ecowaterNextRechargeIsScheduledSchema.parse(nextRecharge)
      expect(nextRechargeIsScheduled).toBe(true)
    })
  })
})
