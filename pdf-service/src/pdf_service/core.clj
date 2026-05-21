(ns pdf-service.core
  (:require
   [ring.adapter.jetty :refer [run-jetty]]
   [cheshire.core :as json]
   [clj-pdf.core :refer [pdf]])
  (:import
   [java.io ByteArrayOutputStream]))

(defn safe-value [reservation key]
  (str (or (get reservation key) "")))

(defn reservation-block [reservation]
  [:paragraph
   (str
    "ID: " (safe-value reservation "id") "\n"
    "Sala: " (safe-value reservation "room_name") "\n"
    "Uzytkownik: " (safe-value reservation "user_name") "\n"
    "Email: " (safe-value reservation "user_email") "\n"
    "Od: " (safe-value reservation "start_time") "\n"
    "Do: " (safe-value reservation "end_time") "\n"
    "Status: " (safe-value reservation "status") "\n"
    "----------------------------------------")])

(defn generate-pdf [reservations]
  (let [out (ByteArrayOutputStream.)
        blocks (map reservation-block reservations)]
    (pdf
     (vec
      (concat
       [{:title "Raport rezerwacji"
         :author "Room Reservation System"
         :size "a4"}

        [:heading "Raport rezerwacji sal"]

        [:paragraph
         "Dokument zostal wygenerowany przez mikroserwis napisany w Clojure."]

        [:spacer 1]]
       blocks))
     out)
    (.toByteArray out)))

(defn response [status body content-type]
  {:status status
   :headers {"Content-Type" content-type
             "Access-Control-Allow-Origin" "*"
             "Access-Control-Allow-Headers" "Content-Type"
             "Access-Control-Allow-Methods" "POST, OPTIONS"}
   :body body})

(defn app [request]
  (cond
    (= (:request-method request) :options)
    (response 200 "" "text/plain")

    (and (= (:request-method request) :post)
         (= (:uri request) "/export-pdf"))
    (try
      (let [body-text (slurp (:body request))
            data (json/parse-string body-text)
            reservations (get data "reservations")
            pdf-bytes (generate-pdf reservations)]
        {:status 200
         :headers {"Content-Type" "application/pdf"
                   "Content-Disposition" "attachment; filename=\"reservations-report.pdf\""
                   "Access-Control-Allow-Origin" "*"}
         :body pdf-bytes})
      (catch Exception e
        (println "PDF error:" (.getMessage e))
        (response 500 "PDF generation error" "text/plain")))

    :else
    (response 404 "Not found" "text/plain")))

(defn -main []
  (println "Clojure PDF service started on port 7000")
  (run-jetty app {:port 7000 :join? false}))