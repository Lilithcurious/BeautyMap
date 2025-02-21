import sys
import json
import os
import cv2
import numpy as np
import traceback

def ensure_directory(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def process_image_to_bw_with_geometry(image_path):
    try:
        print(f"Processing image: {image_path}")
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Failed to read image file: {image_path}")

        # Ensure output directory exists
        output_dir = os.path.join(os.path.dirname(image_path), "analyzed")
        ensure_directory(output_dir)

        # Process image
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 100, 200)

        # Image dimensions
        height, width = gray.shape
        print(f"Image dimensions: {width}x{height}")

        # Facial thirds division
        third_height = height // 3
        upper_third = third_height
        middle_third = 2 * third_height

        # Draw third lines on B&W image
        img_with_geometry = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
        cv2.line(img_with_geometry, (0, upper_third), (width, upper_third), (255, 255, 255), 2)
        cv2.line(img_with_geometry, (0, middle_third), (width, middle_third), (255, 255, 255), 2)

        # Save image with geometry
        output_path = os.path.join(output_dir, "analyzed_face.jpg")
        success = cv2.imwrite(output_path, img_with_geometry)
        if not success:
            raise ValueError(f"Failed to save analyzed image to: {output_path}")

        print(f"Successfully saved analyzed image to: {output_path}")
        return output_path
    except Exception as e:
        print(f"Error in process_image_to_bw_with_geometry: {str(e)}", file=sys.stderr)
        traceback.print_exc()
        raise

def analyze_face(photo_path):
    try:
        print(f"Starting analysis for photo: {photo_path}")
        if not os.path.exists(photo_path):
            raise FileNotFoundError(f"Photo file not found: {photo_path}")

        # Read and process the image
        image = cv2.imread(photo_path)
        if image is None:
            raise ValueError(f"Failed to read image file: {photo_path}")

        print("Successfully read image")

        # Convert to grayscale for face detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Load face detection classifier
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        if not os.path.exists(cascade_path):
            raise FileNotFoundError(f"Cascade classifier not found at: {cascade_path}")

        face_cascade = cv2.CascadeClassifier(cascade_path)
        print("Loaded face cascade classifier")

        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        print(f"Detected {len(faces)} faces")

        if len(faces) == 0:
            raise ValueError("No face detected in the image")

        if len(faces) > 1:
            raise ValueError("Multiple faces detected. Please upload a photo with a single face")

        # Get the face region and analyze proportions
        (x, y, w, h) = faces[0]
        face_roi = gray[y:y+h, x:x+w]

        # Process image with geometry lines
        analyzed_image_path = process_image_to_bw_with_geometry(photo_path)

        # Calculate face shape and proportions
        face_ratio = w / h
        symmetry_offset = abs(0.5 - (x + w/2)/image.shape[1])
        face_width_ratio = w / image.shape[1]

        # Determine face shape
        if face_ratio > 0.95:
            face_shape = "Redondo"
            shape_features = "Curvas suaves, bochechas mais cheias"
        elif face_ratio < 0.85:
            face_shape = "Oval"
            shape_features = "Proporções balanceadas, maçãs do rosto definidas"
        else:
            face_shape = "Quadrado"
            shape_features = "Maxilar forte, ângulos definidos"

        # Analyze facial thirds
        height = image.shape[0]
        third_height = height // 3
        upper_analysis = "Testa proporcional"
        middle_analysis = "Olhos e nariz balanceados"
        lower_analysis = "Região do queixo e boca balanceada"

        if y < third_height:
            upper_analysis = "Testa levemente proeminente"
        if (y + h) > (2 * third_height):
            lower_analysis = "Terço inferior levemente alongado"

        # Format detailed analysis results
        analysis = {
            "facialFeatures": [
                f"Formato do Rosto: {face_shape} - {shape_features}",
                f"Simetria: {'Altamente simétrico' if symmetry_offset < 0.05 else 'Levemente assimétrico'}",
                f"Proporções: {'Balanceadas' if 0.3 < face_width_ratio < 0.45 else 'Largas' if face_width_ratio >= 0.45 else 'Estreitas'}"
            ],
            "facialThirds": [
                f"Terço Superior: {upper_analysis}",
                f"Terço Médio: {middle_analysis}",
                f"Terço Inferior: {lower_analysis}"
            ],
            "skinConditions": [
                "Observação: Análise detalhada da pele requer imagens em alta resolução",
                "Recomendamos consulta profissional para preocupações específicas da pele"
            ],
            "recommendations": [
                f"Base: Escolha uma fórmula que complemente seu formato de rosto {face_shape.lower()}, focando em cobertura uniforme",
                "Contorno: Aplique ao longo das maçãs do rosto e linha do maxilar para realçar a estrutura natural",
                "Blush: Posicione nas maçãs do rosto, misturando para cima em direção às têmporas",
                "Olhos: Use tons claros nas pálpebras, tons mais escuros na dobra para profundidade",
                "Sobrancelhas: Modele para emoldurar o rosto e realçar a simetria",
                "Lábios: Defina com delineador, escolha cores que complementem seu tom de pele"
            ],
            "colorPalette": [
                "Base Neutra: Tons de bege, taupe e marrom suave",
                "Cores de Destaque: Pêssego quente, coral e ouro rosado",
                "Definição: Marrom profundo e ameixa para contorno e olhos"
            ],
            "analyzedImagePath": analyzed_image_path
        }

        print("Analysis completed successfully")
        print(json.dumps(analysis))
        return 0

    except Exception as e:
        error = {
            "error": type(e).__name__,
            "details": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(error), file=sys.stderr)
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Photo path is required"}), file=sys.stderr)
        sys.exit(1)

    photo_path = sys.argv[1]
    sys.exit(analyze_face(photo_path))