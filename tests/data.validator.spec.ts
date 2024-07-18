import { describe, it, expect } from 'vitest'
import { ecowaterDataSchema } from '../src/data.validator'

describe('EcoWater data validator', () => {
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
})
