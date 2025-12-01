## Edge Guardian – AI Emergency Detection
An Edge AI system that can detect, classify, and report emergencies instantly from camera images—running fully on-device (low-power hardware like Raspberry Pi, ESP32-CAM, Jetson Nano, or even laptop webcam).

## **Problem Statement**

Emergencies like road accidents and fire incidents require rapid detection. However, conventional CCTV systems lack real-time understanding and depend on manual monitoring. This leads to delayed responses, increased damage, and loss of lives.

There is a growing need for a **low-cost, automated, and intelligent emergency detection system** that can work without cloud dependencies and perform on-device inference using edge AI.

---

## **Objective**


The objective of **Edge Guardian** is to build a real-time edge AI emergency detection application capable of identifying critical situations (starting with **Fire** and **Road Accidents**) and generating contextual emergency alerts with recommended actions.

The system combines:

- **Edge Impulse**
- **Local Dockerized inference engine**
- **Agentic AI (Google Gemini via Genkit)**
- **Next.js dashboard + email notifications**

Future versions will expand to medical emergencies, women-safety threats, and disaster detection with hardware deployment.

---

## **Project Description**

**Edge Guardian** is a web-based emergency detection system that analyzes images to identify whether a **fire** or **road accident** has occurred. It provides a fully automated alerting mechanism powered by an Edge Impulse model and an AI reasoning agent.

### **Current Implementation Highlights**

- Detects **Fire** & **Road Accidents** using Edge Impulse-trained image classifier  
- Model inference performed using **Edge Impulse Docker container running locally**  
- User can report incidents via:
  - Webcam capture  
  - Image upload  
  - Sample image library  
- Google Gemini (Genkit) generates:
  - Severity assessment  
  - Human-readable emergency summary  
  - Recommended actions  
- Alerts are sent via **email** to multiple recipients with embedded incident images  
- A clean, modern **web dashboard** displays all alerts in real-time  

---

### **Future Enhancements**

#### **Integration with physical edge devices:**
- Raspberry Pi  
- ESP32-CAM  
- IP Cameras  

#### **Additional emergency categories:**
- Medical Emergency (fall detection)  
- Women safety / Violence detection  
- Disaster debris, building collapse  
- Smoke-only detection  

#### **Other improvements:**
- Continuous video stream inference  
- GPS + location tagging  

---

## **Dataset Used**
- **Source:** Kaggle – Fire & Smoke Detection Dataset  
- **Link:** https://www.kaggle.com/datasets/mehwishtahir722/synthetic-dataset-for-accident-detection
https://www.kaggle.com/datasets/phylake1337/fire-dataset
 
- **Usage:**
  - Real-world fire, smoke,flames,Accident scenes, vehicle collisions  
  - Cleaned, resized to 96x96  
  - Labeled in Edge Impulse as **Fire_Incident** , **Road_Incident**, **No_Incident**


### **Dataset Notes**
- Both datasets are **open-source** and **permissively licensed**.  
- Only two classes are used currently: **accident**, **fire**.  
- Images were cleaned, augmented, and uploaded to Edge Impulse for training.  

---

## **Methodology**

### **1. Data Preparation**
- Downloaded open datasets for Fire & Road Accidents  
- Resized, balanced, and augmented the dataset  
- Uploaded to Edge Impulse Studio for training  

### **2. Model Training (Edge Impulse)**
- Used Image Classification pipeline  
- MobileNetV2 + Transfer Learning  
- Optimized using EON Compiler  
- Exported as **Docker-compatible inference engine**  

### **3. Local Inference (Docker)**
- Deployed Edge Impulse model as a local Docker container  
- Next.js service sends the captured/uploaded image to the container  
- Container returns prediction + confidence score  

### **4. Agentic AI (Genkit + Gemini)**
- Takes the model output (e.g., *“fire detected”*)  
- Generates:
  - Severity level  
  - Description of the situation  
  - Step-by-step emergency response plan  

### **5. Notification & Dashboard**
- Next.js app displays logs and alerts in real-time  
- Nodemailer sends emails with:
  - Title  
  - Summary  
  - Confidence score  
  - Full recommended action list  
  - Embedded image  

---

## **Scope of the Solution**

### **Current Scope**
- Fire & Road Accident detection  
- Web-based simulation (webcam + image upload)  
- Model inference via local Docker  
- AI-powered alert generation  
- Real-time dashboard + email notifications  

### **Future Scope**
- Hardware deployment  
- Multi-class emergency detection  
- Real-time video stream support  
- Integration with government/civic emergency systems  
- GPS tagging & mobile app integration  

---
## Architecture and Flow 
<img width="2144" height="593" alt="Edge Guardian Flow" src="https://github.com/user-attachments/assets/db1f7cd5-601b-4fe6-b729-fc26120c3afa" />

<img width="1600" height="545" alt="Edge Guardian Architecture " src="https://github.com/user-attachments/assets/f86c4b33-83f3-4620-8e3e-a68e74f508fa" />



## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20 or later recommended)
-   An Edge Impulse project with a deployed image classification model.
-   A Google AI Studio API key for Gemini.
-   SMTP credentials from an email provider (e.g., SendGrid, Mailgun, or a personal Gmail account).

### Run Edge Impulse Model as a docker container in local
Use model variant Quantized (int8)
```
docker run --rm -it \
    -p 1337:1337 \
    public.ecr.aws/g7a8t7v6/inference-container:v1.79.5 \
        --api-key ei_cca02e3de1b4b81f5909f4bf44a0a09421dcacb57d22aa267c7ec83a60a6b868 \
        --run-http-server 1337

```

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd <your-repository>
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a new file named `.env` in the root of the project and add the following variables.

    ```env
    # URL for your deployed Edge Impulse model's API endpoint
    # example http://localhost:1337/api/image
    EDGE_IMPULSE_API_URL="<your_edge_impulse_docker_conatiner_exposed_url>"
   

    # Your API key from Google AI Studio
    GEMINI_API_KEY="<your_google_ai_studio_api_key>"

    # Your SMTP provider's credentials for sending email notifications
    SMTP_HOST="<your_smtp_host>"
    SMTP_PORT="<your_smtp_port>" # e.g., 587 for TLS, 465 for SSL
    SMTP_USER="<your_smtp_username>"
    SMTP_PASS="<your_smtp_password_or_app_key>"
    ```

### Running the Application

1.  **Start the development server:**
    ```sh
    npm run dev
    ```

2.  Open [http://localhost:9002](http://localhost:9002) in your browser to see the application.

3.  To run the Genkit development UI (optional):
    ```sh
    npm run genkit:dev
    ```
    This will start the Genkit inspector on [http://localhost:4000](http://localhost:4000), where you can view your AI flows and traces.
    
## Application 

<img width="2864" height="1626" alt="home-page" src="https://github.com/user-attachments/assets/bff5ee10-12cc-457c-9f23-c9c480e7ddb6" />

<img width="2868" height="1625" alt="incident_output_report_page" src="https://github.com/user-attachments/assets/b62bae1b-6f47-40b2-8e6f-d37d6bf15eed" />

<img width="2356" height="1524" alt="local-access-edge-impulse-project" src="https://github.com/user-attachments/assets/88ef9163-378b-40a8-99b9-1af7bbfddd81" />

<img width="2879" height="1545" alt="road_incident_mail" src="https://github.com/user-attachments/assets/c021b5e8-ee4f-40b3-b865-e0b2ba1b9f7e" />

<img width="2874" height="1636" alt="road_incident_output_report_page" src="https://github.com/user-attachments/assets/25d6764b-68b7-4b13-923d-24a0180ae7fe" />

<img width="2879" height="1709" alt="edge-impulse-model-docker-deployment" src="https://github.com/user-attachments/assets/559093b1-0406-4020-aa15-ef82d4d88725" />


## **Conclusion**

**Edge Guardian** demonstrates how an Edge Impulse model combined with Agentic AI can create a powerful emergency detection system running on edge infrastructure. Even in its early phase (Fire + Road Accident detection), the system proves **practical, scalable, and capable of saving lives by reducing response time**.

The project is designed to evolve into a fully autonomous emergency-response agent integrated with low-cost edge devices, delivering real-world impact aligned with the **AI for Good** mission.






