import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';

// --------------------------------------------------------------

export interface ApiProps {
    stage: string;
    function: lambda.Function;
    enableLogging: boolean;
    zone: route53.IHostedZone;
    domainPrefix?: string;
}

export class Api extends Construct {
    public readonly api: apigw.LambdaRestApi;

    constructor(scope: Construct, id: string, props: ApiProps) {
        super(scope, id);

        const hostedZoneName = props.zone.zoneName
        const domainName = props.domainPrefix ? `${props.domainPrefix}.${hostedZoneName}` : hostedZoneName

        this.api = new apigw.LambdaRestApi(this, `${id}Gateway`, {
            cloudWatchRole: props.enableLogging,
            handler: props.function,
            deployOptions: {
                stageName: props.stage,
                loggingLevel: props.enableLogging ? apigw.MethodLoggingLevel.INFO : apigw.MethodLoggingLevel.OFF,
                dataTraceEnabled: props.enableLogging,
            },
            domainName: {
                domainName: domainName,
                certificate: new acm.Certificate(this, `${id}ApiCert`, {
                    domainName: domainName,
                    validation: acm.CertificateValidation.fromDns(props.zone)
                })
            },
            // Make this alterable in the construct and more fine tuned
            defaultCorsPreflightOptions: {
                allowOrigins: apigw.Cors.ALL_ORIGINS,
                allowMethods: apigw.Cors.ALL_METHODS,
            },
        });

        if (props.zone) { // Only create a record if zone is provided
            new route53.ARecord(this, `${id}ApiDomain`, {
                zone: props.zone,
                target: route53.RecordTarget.fromAlias(new route53targets.ApiGateway(this.api)),
                recordName: domainName
            });
        }
    }
}