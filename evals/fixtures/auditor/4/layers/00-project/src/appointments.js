const EMAIL = /^[^@\s]+@[^@\s]+$/;

export class ValidationError extends Error {}

export function formatTime(date) {
  return `${date.toISOString().replace('T', ' ').slice(0, 16)} UTC`;
}

export function createAppointmentService({ records, mailer, now = () => new Date() }) {
  async function book({ patientName, patientEmail, startsAt, clinician } = {}) {
    if (!patientName?.trim()) throw new ValidationError('patientName is required');
    if (!EMAIL.test(patientEmail ?? '')) throw new ValidationError('patientEmail is invalid');
    const start = new Date(startsAt);
    if (Number.isNaN(start.getTime())) throw new ValidationError('startsAt must be an ISO 8601 time');
    if (start <= now()) throw new ValidationError('startsAt must be in the future');

    const appointment = await records.createAppointment({
      patientName: patientName.trim(),
      patientEmail: patientEmail.toLowerCase(),
      startsAt: start.toISOString(),
      clinician: clinician ?? null,
      status: 'BOOKED',
    });
    await mailer.send({
      to: appointment.patientEmail,
      subject: 'Appointment confirmed',
      text: `Your appointment is booked for ${formatTime(start)}.`,
    });
    return appointment;
  }

  async function cancel(id) {
    const appointment = await records.getAppointment(id);
    if (!appointment) return null;
    if (appointment.status === 'CANCELLED') return appointment;
    return records.updateAppointment(id, { status: 'CANCELLED' });
  }

  async function upcoming() {
    const current = now();
    const all = await records.listAppointments();
    return all
      .filter((appointment) => appointment.status === 'BOOKED' && new Date(appointment.startsAt) > current)
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  }

  return { book, cancel, upcoming };
}
