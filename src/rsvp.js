export function validateRsvp({ name, attendance, pax } = {}) {
  const errors = {};
  if (typeof name !== 'string' || !name.trim()) errors.name = 'Sila masukkan nama anda.';
  else if (name.trim().length > 120) errors.name = 'Nama mestilah tidak melebihi 120 aksara.';
  if (!['yes', 'no'].includes(attendance)) errors.attendance = 'Sila pilih status kehadiran.';
  if (attendance === 'yes' && (!Number.isInteger(Number(pax)) || Number(pax) < 1 || Number(pax) > 99)) {
    errors.pax = 'Sila masukkan bilangan tetamu antara 1 hingga 99, termasuk anda.';
  }
  return errors;
}

// Portfolio demo: validation and confirmation stay in memory only.
export async function submitRsvp(values) {
  const errors = validateRsvp(values);
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, attendance: values.attendance };
}
