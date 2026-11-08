/* 预约准入校验：年龄 / 性别 / 人群 / 前置问卷 */
(function () {
  'use strict';
  const EN = window.Engine;
  const S = () => Store.db;

  EN.ensureCustomer = function () {
    const db = Store.db;
    (db.fivegood.members || []).forEach((m, i) => {
      if (m.age == null) m.age = [32, 38, 29, 41, 35, 46][i % 6];
      if (!m.gender) m.gender = i % 2 ? 'male' : 'female';
    });
  };
  EN.customerOf = function (name) {
    EN.ensureCustomer();
    return (Store.db.fivegood.members || []).find((m) => m.name === name);
  };
  EN.bookingOf = function (serviceName) {
    const svc = (Store.db.employee.services || []).find((s) => s.name === serviceName || s.id === serviceName);
    return svc ? svc.booking : null;
  };

  /** 返回 {ok, reasons[]} */
  EN.canBook = function (order) {
    const b = EN.bookingOf(order.item);
    if (!b) return { ok: true, reasons: [] };
    const c = EN.customerOf(order.customer);
    const reasons = [];
    if (c) {
      if (c.age != null && (c.age < b.ageMin || c.age > b.ageMax)) reasons.push('年龄 ' + c.age + ' 岁不在 ' + b.ageMin + '–' + b.ageMax + ' 岁范围');
      if (b.gender !== 'any' && c.gender && c.gender !== b.gender) reasons.push('该服务' + (b.gender === 'female' ? '仅限女性' : '仅限男性'));
      if (b.audience && b.audience.length && b.audience.indexOf('全员') < 0 && b.audience.indexOf('在职职工') < 0) {
        const tags = (c.tier || '') + ' ' + (c.status || '');
        const okAud = b.audience.some((a) => tags.indexOf(a) >= 0) || b.audience.indexOf('高危人群') >= 0;
        if (!okAud) reasons.push('不属于适用人群：' + b.audience.join('/'));
      }
    }
    if (b.preSurvey && order.surveyDone === false) reasons.push('需先完成前置问卷');
    return { ok: reasons.length === 0, reasons: reasons };
  };
})();
