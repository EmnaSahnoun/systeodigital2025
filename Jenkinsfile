
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
                git url: 'https://github.com/EmnaSahnoun/systeodigital2025.git', branch: 'main'
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
                            sh "docker build -t emnasahnoun/eureka-server ."
                        }
                    }
                }
                
                stage('Build Gateway Image') {
                    steps {
                        dir('Gatway') {
                            sh "docker build -t emnasahnoun/gateway-service ."
                        }
                    }
                }
                
                stage('Build ProjectService Image') {
                    steps {
                        dir('ProjectService') {
                            sh "docker build -t emnasahnoun/project-service ."
                        }
                    }
                }
                
                stage('Build ActivityService Image') {
                    steps {
                        dir('Activity-Service') {
                            sh "docker build -t emnasahnoun/activity-service ."
                        }
                    }
                }
                
                stage('Build DocumentService Image') {
                    steps {
                        dir('DocumentService') {
                            sh "docker build -t emnasahnoun/document-service ."
                        }
                    }
                }
                
                stage('Build Frontend Image') {
    steps {
        dir('WebFront') {
            script {
                try {
                    sh "docker build -t emnasahnoun/angular-frontend ."
                } catch (e) {
                    echo "Frontend build failed: ${e}"
                    // Optional: add more debugging
                    sh 'ls -la' // Show directory contents
                }
            }
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
                    sh "docker login -u emnasahnoun -p ${env.DockerHubPassword}"
                    
                    sh "docker push emnasahnoun/eureka-server"
                    sh "docker push emnasahnoun/gateway-service"
                    sh "docker push emnasahnoun/project-service"
                    sh "docker push emnasahnoun/activity-service"
                    sh "docker push emnasahnoun/document-service"
                    sh "docker push emnasahnoun/angular-frontend"
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

