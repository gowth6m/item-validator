#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BackendStack } from '../lib/backend-stack';

// --------------------------------------------------------------

const defaultAccountID = '398496408008';
const defaultRegion = 'eu-west-2';
const defaultStage = 'dev';

const accountID = process.env.ACCOUNT_ID ? process.env.ACCOUNT_ID : defaultAccountID;
const region = process.env.REGION ? process.env.REGION : defaultRegion;
const stage = process.env.STAGE ? process.env.STAGE : defaultStage;

const stackName = `BackendStack-${stage}`;

// --------------------------------------------------------------

const app = new cdk.App();
new BackendStack(app, stackName, {
  env: {
    account: accountID,
    region: region,
  },
  stage: stage,
  stackName: stackName,
  description: `Backend stack for ${stage} stage`,
});