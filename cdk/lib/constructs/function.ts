import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from './sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';

// --------------------------------------------------------------

export enum FunctionLanguage {
    GO = 'GO',
    PYTHON = 'PYTHON'
}

export interface FunctionProps {
    readonly stage: string;
    readonly cmd: string;
    readonly language: FunctionLanguage;
    readonly jqSource?: sqs.JobQueue
    readonly timeout?: cdk.Duration;
    readonly memorySize?: number;
    readonly layers?: string[];
}

export class Function extends lambda.Function {
    constructor(scope: Construct, id: string, props: FunctionProps) {
        let runtime: lambda.Runtime;
        let handler: string;

        switch (props.language) {
            case FunctionLanguage.GO:
                runtime = lambda.Runtime.PROVIDED_AL2;
                handler = 'main';
                break;
            case FunctionLanguage.PYTHON:
                runtime = lambda.Runtime.PYTHON_3_9;
                handler = 'main.lambda_handler';
                break;
            default:
                throw new Error(`Unsupported function language: ${props.language}`);
        }

        const layers = props.layers?.map(arn => lambda.LayerVersion.fromLayerVersionArn(scope, 'Layer', arn));


        super(scope, id, {
            runtime: runtime,
            handler: handler,
            code: lambda.Code.fromAsset(`${props.cmd}.zip`),
            timeout: props.timeout,
            memorySize: props.memorySize,
            environment: {
                STAGE: props.stage
            },
            layers: layers
        });

        if (props.jqSource) {
            this.addEventSource(new lambdaEventSources.SqsEventSource(props.jqSource.queue));
        }
    }
}