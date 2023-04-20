# Requirements

- Google Cloud account
- gcloud CLI
- Terraform CLI

# How it works

bla bla bla

# Setup Google Cloud Platform

> GCP > Create Project > `${projectName}`

> GCP > IAM et Administration > Service account > Create a service account `${serviceAccountName`

> GCP > IAM et Administration > Service account > `${serviceAccountName}` > Key > Create key 

> Save download key into `server` folder as `googleKeys.json`

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

# Setup server

```sh
# Move to server directory
$ cd server 

# Install deps
$ (yarn | npm) install

# Transform and fill `env.template` to `.env` file 

# Launch (hot reload)
$ npm run dev
```

# Setup database 

> GCP > SQL > mydatabaseinstance > users > Add user 
> GCP > SQL > mydatabaseinstance > networks > add network > `${your ip}` > Save
> GCP > SQL > mydatabaseinstance > database > create new database > `bike__prediction`