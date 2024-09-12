import moment from 'moment';
import { QTableProps } from 'quasar';

export const columnasAsistencias: QTableProps['columns'] = [
  {
    name: 'codigo',
    align: 'left',
    label: 'ID',
    field: 'codigo',
  },
  {
    name: 'entrada',
    align: 'left',
    label: 'Hora de entrada',
    field: (row) =>
      row.entrada ? moment(row.entrada).format('HH:mm - DD/MM/YY') : '',
  },
  {
    name: 'salida',
    label: 'Hora de salida',
    field: (row) =>
      row.salida ? moment(row.salida).format('HH:mm - DD/MM/YY') : '',
    align: 'left',
  },
  {
    name: 'horas',
    label: 'Horas suplementarias',
    field: 'horas',
    align: 'left',
  },
];
