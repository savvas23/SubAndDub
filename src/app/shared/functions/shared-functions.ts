import { TimeFormat } from "src/app/models/general/time-format.model";

export function parseTimestamp(value: string): TimeFormat {
    const parts = value.split(':');
    const [seconds, milliseconds] = parts[2].split('.');
    
    const timeformatObject: TimeFormat = {
      hour: parseInt(parts[0], 10),
      minute: parseInt(parts[1], 10),
      seconds: parseInt(seconds, 10),
      ms: parseInt(milliseconds, 10)
    };
    
    return timeformatObject;
  }
  
  export function calculateSeconds(timeFormat: TimeFormat): number {
    return (timeFormat.hour * 60 * 60) + (timeFormat.minute * 60) + timeFormat.seconds + (timeFormat.ms/1000);
  }