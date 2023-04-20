# Requirements

- Google Cloud account
- gcloud CLI
- Terraform CLI

# How it works

This project allow to predict bike activity in paris

# Setup Google Cloud Platform

> GCP > Create Project > `${projectName}`

# Setup infra

(Need to be log to gcloud)

In `infra/provider.tf`, define the project value with project id

```sh
# Define a default project ID  
$ gcloud config set project ${projectId}

# Move to infra directory
$ cd infra 

# Init infrastucture project
$ terraform init

# Deploy infrastructure
$ terraform apply -auto-approve 
```

# Setup database 

> GCP > SQL > mydatabaseinstance > users > Add user 
> GCP > SQL > mydatabaseinstance > networks > add network > `${your ip}` > Save
> GCP > SQL > mydatabaseinstance > database > create new database > `bike__prediction`

# Download dataset

```sh
# Move to src directory
$ cd src

# Install deps
$ (yarn | npm) install

# Transform and fill `env.template` to `.env` file 

# Download all dataset + insert into db
$ tsc && node ./dist/scripts/fillDb.js
```