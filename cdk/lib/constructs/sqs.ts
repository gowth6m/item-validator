import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';

// --------------------------------------------------------------

export interface JobQueueProps {
    readonly retries: number;
    readonly visibilityTimeout?: cdk.Duration;
}

export class JobQueue extends Construct {
    queue: sqs.Queue;
    dlq: sqs.Queue;
    param: ssm.StringParameter

    constructor(scope: Construct, id: string, props: JobQueueProps) {
        super(scope, id);

        this.dlq = new sqs.Queue(this, 'DLQ');
        this.queue = new sqs.Queue(this, 'Queue', {
            deadLetterQueue: {
                queue: this.dlq,
                maxReceiveCount: props.retries
            },
            visibilityTimeout: props.visibilityTimeout
        });

        this.param = new ssm.StringParameter(this, 'QueueURL', {
            parameterName: `/${cdk.Stack.of(this).stackName}/${id}QueueURL`,
            stringValue: this.queue.queueUrl,
        });
    }

    public grantSendMessages(grantee: iam.IGrantable): iam.Grant {
        this.param.grantRead(grantee);
        return this.queue.grantSendMessages(grantee);
    }
}