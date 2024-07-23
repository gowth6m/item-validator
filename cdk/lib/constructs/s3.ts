import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

// --------------------------------------------------------------

export interface SimpleBucketProps extends Omit<s3.BucketProps, 'bucketName'> {
    bucketName: string;
}

export class SimpleBucket extends s3.Bucket {
    private param: ssm.StringParameter;

    constructor(scope: Construct, id: string, props: SimpleBucketProps) {
        super(scope, id, props);

        this.param = new ssm.StringParameter(this, 'SimpleBucketParam', {
            parameterName: `/${cdk.Stack.of(this).stackName}/${id}`,
            stringValue: this.bucketName
        });
    }

    public allowReadAccess(grantee: iam.IGrantable): iam.Grant {
        this.param.grantRead(grantee);
        return this.grantRead(grantee);
    }

    public allowReadWriteAccess(grantee: iam.IGrantable): iam.Grant {
        this.param.grantRead(grantee);
        return this.grantReadWrite(grantee);
    }
}