import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as efs from 'aws-cdk-lib/aws-efs';
import { Config } from '../configs/loader';

interface IProps extends StackProps {
  vpc: ec2.IVpc;
}

export class EfsStack extends Stack {
  public readonly fileSystem: efs.IFileSystem;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id, props);

    this.fileSystem = this.newFileSystem(props);
  }

  newFileSystem(props: IProps): efs.FileSystem {
    const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      securityGroupName: `${Config.Ns}EFSSecurityGroup`,
      vpc: props.vpc,
    });

    const fileSystem = new efs.FileSystem(this, `FileSystem`, {
      vpc: props.vpc,
      securityGroup,
      encrypted: true,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
      throughputMode: efs.ThroughputMode.BURSTING,
      removalPolicy: Config.IsDev()
        ? RemovalPolicy.DESTROY
        : RemovalPolicy.RETAIN,
    });
    fileSystem.connections.allowInternally(ec2.Port.allTraffic());

    return fileSystem;
  }
}
