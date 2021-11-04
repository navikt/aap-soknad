import {format} from "date-fns";
import {nb} from "date-fns/locale";

export const formatDate = (date: any, formatStr: string) => format(date, formatStr, { locale: nb });
