import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

// --------------------------------------------------------------

export interface BackendProps extends cdk.StackProps {
  readonly stage: string;
}

// --------------------------------------------------------------

export class BackendStack extends cdk.Stack {

  stage: string;

  constructor(scope: Construct, id: string, props: BackendProps) {
    super(scope, id, props);

    this.stage = props.stage

    const backendLambda = new lambda.DockerImageFunction(this, 'BackendLambda', {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '..', '..', 'backend')),
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      architecture: lambda.Architecture.ARM_64, // Machine you are using (x86_64 (intel) or ARM_64 (Apple M1))
    });

    const api = new apigateway.LambdaRestApi(this, 'BackendAPI', {
      handler: backendLambda,
      proxy: true,
    });
  }

  isProd(): boolean {
    return this.stage == "prod"
  }
}
