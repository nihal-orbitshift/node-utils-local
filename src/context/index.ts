import _ from "lodash";
import {v4 as uuidv4} from "uuid";
import winston, {Logger} from "winston";

const {  format, transports } = winston;

export interface IContext {
    reqId: string;
    logger: Logger;
    runTag?: string;
}

export class Context implements IContext {
    reqId: string;
    logger: Logger;

    constructor(appName: string, config?: { logs?: { enable?: boolean; filePath: string } }) {
        this.reqId = uuidv4()
        this.logger = this.createDefaultLogger({ appName, config });
    }

    private createDefaultLogger({ appName, config = {} } : { config?: { logs?: { enable?: boolean; filePath: string } }, appName: string}): Logger {
        const transportConfig: any = [
            new transports.Console(),
        ]
        if (!_.isEmpty(config.logs) && config.logs.enable) {
            transportConfig.push(new transports.File({ filename: config.logs.filePath || 'logs/combined.log' }));
        }
        return winston.createLogger({
            level: 'debug',
            format: format.combine(
                format.errors({ stack: true }),
                format.timestamp({
                    format: () => {
                        return new Date().toLocaleString('en-US', {
                            timeZone: 'Asia/Kolkata'
                        });
                    }
                }),
                format.printf((...args) => {
                    let arg = args[0];
                    return `${arg.timestamp} [${arg.level.toUpperCase()}]: ReqId:${this.reqId || 'UNKNOWN'} ${arg.message} ${
                        arg.payload !== undefined ? JSON.stringify(arg.payload) : ''
                    }`;
                })
            ),
            transports: transportConfig
        });
    }
}