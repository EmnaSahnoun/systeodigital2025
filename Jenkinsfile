pipeline {
    agent any
    tools {
        jdk 'jdk-17'
    }
environment {
        DOCKER_REGISTRY = 'emnasahnoun' // Votre namespace Docker Hub
    }
    
  
    stages{
        stage('code'){
            steps {
                git url: 'https://github.com/EmnaSahnoun/test.git', branch: 'main'
            }
        }
      stage('Build and Package') {
         parallel {
                stage('Build Eureka') {
                    steps {
                        withMaven(maven: 'maven-3.6.3') {
                            dir('EurekaCompain') {  
                                sh 'mvn clean package -DskipTests'
                            }
                        }
                    }
                }
                
                stage('Build Gateway') {
                    steps {
                        withMaven(maven: 'maven-3.6.3') {
                            dir('Gatway') {  
                                sh 'mvn clean package -DskipTests'
                            }
                        }
                    }
                }
                
                stage('Build Project Service') {
                    steps {
                        withMaven(maven: 'maven-3.6.3') {
                            dir('ProjectService') {  
                                sh 'mvn clean package -DskipTests'
                            }
                        }
                    }
                }
                
                stage('Build Activity Service') {
                    steps {
                        withMaven(maven: 'maven-3.6.3') {
                            dir('Activity-Service') {  
                                sh 'mvn clean package -DskipTests'
                            }
                        }
                    }
                }
                
                stage('Build Document Service') {
                    steps {
                        withMaven(maven: 'maven-3.6.3') {
                            dir('DocumentService') {  
                                sh 'mvn clean package -DskipTests'
                            }
                        }
                    }
                }
            }
        }
           
        stage('Build Docker Images') {
            parallel {
                stage('Build Eureka Image') {
                    steps {
                        dir('EurekaCompain') {
                            sh "docker build -t ${env.DOCKER_REGISTRY}/eureka-server:latest ."
                        }
                    }
                }
                
                stage('Build Gateway Image') {
                    steps {
                        dir('Gatway') {
                            sh "docker build -t ${env.DOCKER_REGISTRY}/gateway-service:latest ."
                        }
                    }
                }
                
                stage('Build ProjectService Image') {
                    steps {
                        dir('ProjectService') {
                            sh "docker build -t ${env.DOCKER_REGISTRY}/project-service:latest ."
                        }
                    }
                }
                
                stage('Build ActivityService Image') {
                    steps {
                        dir('Activity-Service') {
                            sh "docker build -t ${env.DOCKER_REGISTRY}/activity-service:latest ."
                        }
                    }
                }
                
                stage('Build DocumentService Image') {
                    steps {
                        dir('DocumentService') {
                            sh "docker build -t ${env.DOCKER_REGISTRY}/document-service:latest ."
                        }
                    }
                }
                
                stage('Build Frontend Image') {
                    steps {
                        dir('BankprojetFront') {
                            sh "docker build -t ${env.DOCKER_REGISTRY}/angular-frontend:latest ."
                        }
                    }
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'Docker_Hub',
                    passwordVariable: 'DockerHubPassword',
                    usernameVariable: 'DockerHubUsername'
                )]) {
                    sh "docker login -u ${env.DockerHubUsername} -p ${env.DockerHubPassword}"
                    
                    sh "docker push ${env.DOCKER_REGISTRY}/eureka-server:latest"
                    sh "docker push ${env.DOCKER_REGISTRY}/gateway-service:latest"
                    sh "docker push ${env.DOCKER_REGISTRY}/project-service:latest"
                    sh "docker push ${env.DOCKER_REGISTRY}/activity-service:latest"
                    sh "docker push ${env.DOCKER_REGISTRY}/document-service:latest"
                    sh "docker push ${env.DOCKER_REGISTRY}/angular-frontend:latest"
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'docker-compose down && docker-compose up -d'
            }
        }
    }
}
