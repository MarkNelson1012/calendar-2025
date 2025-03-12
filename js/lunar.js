// 使用立即执行函数表达式(IIFE)来避免全局作用域污染
(function() {
    // 农历1900-2100的润大小信息表
    const lunarInfo = [
        0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
        0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
        0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
        0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
        0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
        0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
        0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
        0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,
        0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
        0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
        0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
        0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
        0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
        0x05aa0,0x076a3,0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
        0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0
    ];

    // 农历月份名
    const lunarMonths = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
    
    // 农历日期名
    const lunarDays = [
        '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
        '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
        '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'
    ];

    // 获取农历年的总天数
    function getLunarYearDays(year) {
        let totalDays = 348;
        for (let i = 0x8000; i > 0x8; i >>= 1) {
            totalDays += (lunarInfo[year - 1900] & i) ? 1 : 0;
        }
        return totalDays + getLeapMonthDays(year);
    }

    // 获取农历年闰月的天数
    function getLeapMonthDays(year) {
        if (getLeapMonth(year)) {
            return (lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
        }
        return 0;
    }

    // 获取农历年闰月月份，0表示没有闰月
    function getLeapMonth(year) {
        return lunarInfo[year - 1900] & 0xf;
    }

    // 获取农历月份的总天数
    function getMonthDays(year, month) {
        return (lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29;
    }

    // 公历转农历
    function solarToLunar(year, month, day) {
        // 参数范围检查
        if (year < 1900 || year > 2100) {
            return {
                error: '超出年份范围(1900-2100)'
            };
        }

        // 计算距离1900年1月31日的天数
        let offset = (Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 31)) / 86400000;

        // 计算农历年
        let lunarYear = 1900;
        for (; lunarYear < 2101 && offset > 0; lunarYear++) {
            let daysInLunarYear = getLunarYearDays(lunarYear);
            offset -= daysInLunarYear;
        }
        if (offset < 0) {
            offset += getLunarYearDays(--lunarYear);
        }

        // 计算农历月
        let lunarMonth = 1;
        let isLeap = false;
        let leapMonth = getLeapMonth(lunarYear);
        let daysInMonth;

        for (; lunarMonth < 13 && offset > 0; lunarMonth++) {
            // 闰月
            if (leapMonth > 0 && lunarMonth === (leapMonth + 1) && !isLeap) {
                --lunarMonth;
                isLeap = true;
                daysInMonth = getLeapMonthDays(lunarYear);
            } else {
                daysInMonth = getMonthDays(lunarYear, lunarMonth);
            }

            if (isLeap && lunarMonth === (leapMonth + 1)) {
                isLeap = false;
            }
            offset -= daysInMonth;
        }

        if (offset === 0 && leapMonth > 0 && lunarMonth === leapMonth + 1) {
            if (isLeap) {
                isLeap = false;
            } else {
                isLeap = true;
                --lunarMonth;
            }
        }

        if (offset < 0) {
            offset += daysInMonth;
            --lunarMonth;
        }

        // 计算农历日
        let lunarDay = offset + 1;

        // 返回结果
        return {
            lunarYear: lunarYear,
            lunarMonth: lunarMonth,
            lunarDay: lunarDay,
            isLeap: isLeap,
            lunarMonthName: (isLeap ? '闰' : '') + lunarMonths[lunarMonth - 1],
            lunarDayName: lunarDays[lunarDay - 1]
        };
    }

    // 将农历转换函数暴露到全局作用域
    window.LunarCalendar = {
        solarToLunar: solarToLunar
    };
})(); 