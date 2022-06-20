# Start cloudwatch agent

mkdir -p /root/.aws


cat << EOF > /root/.aws/credentials
[AmazonCloudWatchAgent]
aws_access_key_id = $AWS_ACCESS_KEY_ID
aws_secret_access_key = $AWS_SECRET_ACCESS_KEY
aws_session_token = $AWS_SESSION_TOKEN
aws_session_token = $AWS_SESSION_TOKEN
region = eu-south-1
EOF


# Start cloudwatch agent.
/opt/aws/amazon-cloudwatch-agent/bin/start-amazon-cloudwatch-agent&
sleep 10
K6_STATSD_ENABLE_TAGS=true k6 run --out statsd $1

sleep 60
cat /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log