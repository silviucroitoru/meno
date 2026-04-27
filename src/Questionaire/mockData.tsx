export const mockData = {
  "SubmissionID": 70,
  "questionnaire": {
    "info": [
      {
        "QuestionType": "intro",
        "settings": {
          "RichText": "<h1>Peste 1000 de femei<br />au ales evrbloom</h1>",
          "MediaUrl": "/assets/media_dummy.png"
        },
        "DataPointName": "Media",
        "position": 1
      },
      // {
      //   "QuestionType": "intro",
      //   "settings": {
      //     "RichText": "<h1>Bine ai venit la EvrBloom</h1><p>Chestionarul nostru te ajută să îți identifici etapa în care te afli în călătoria menopauzei și îți oferă informații bazate pe știință pentru a-ți susține sănătatea.</p><p>Calculatorul Scorului Menopauzei îți oferă o mai bună înțelegere a impactului menopauzei asupra vieții tale și cum îți poți îmbunătăți starea de bine cu informațiile și suportul potrivit.<br><br>Răspunde sincer pentru cele mai precise rezultate.</p><p>Începem!</p>"
      //   },
      //   "DataPointName": "WelcomeMessage",
      //   "position": 1
      // },
      {
        "QuestionType": "first_name",
        "settings": {
          "QuestionHelper": "Te rugăm să introduci prenumele tău.",
          "QuestionText": "Care este prenumele tău?"
        },
        "DataPointName": "FirstName",
        "position": 2
      },
      {
        "QuestionType": "custom_form",
        "settings": {
          "fields": [
            {
              "error_message": "Acest câmp este obligatoriu.",
              "label": "Anul nașterii",
              "type": "numeric",
              "mandatory": true,
              "measurement": "An"
            }
          ],
          "QuestionHelper": "Te rugăm să introduci anul în care te-ai născut.",
          "QuestionText": "Care este anul tău de naștere?"
        },
        "DataPointName": "BirthYear",
        "position": 3
      },
      {
        "QuestionType": "custom_form",
        "settings": {
          "fields": [
            {
              "error_message": "Acest câmp este obligatoriu.",
              "label": "Înălțime",
              "type": "numeric",
              "mandatory": true,
              "measurement": "cm"
            }
          ],
          "QuestionHelper": "Te rugăm să introduci înălțimea ta în centimetri.",
          "QuestionText": "Care este înălțimea ta?"
        },
        "DataPointName": "Height",
        "position": 4
      },
      {
        "QuestionType": "custom_form",
        "settings": {
          "fields": [
            {
              "error_message": "Acest câmp este obligatoriu.",
              "label": "Greutate",
              "type": "numeric",
              "mandatory": true,
              "measurement": "kg"
            }
          ],
          "QuestionHelper": "Te rugăm să introduci greutatea ta în kilograme.",
          "QuestionText": "Care este greutatea ta actuală?"
        },
        "DataPointName": "Weight",
        "position": 5
      },
      {
        "QuestionType": "single_option",
        "settings": {
          "options": [
            {
              "OptionText": "Am menstruații regulate."
            },
            {
              "OptionText": "Menstruațiile mele sunt încă regulate, dar s-au schimbat ca durată sau flux."
            },
            {
              "OptionText": "Am menstruații neregulate și uneori trec luni fără să am menstruație."
            },
            {
              "OptionText": "Nu am avut menstruație de câteva luni, dar mai puțin de un an."
            },
            {
              "OptionText": "Nu am avut menstruație de un an sau mai mult."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine modelul ciclului tău menstrual.",
          "QuestionText": "Care dintre următoarele opțiuni descrie cel mai bine starea ta menstruală actuală?"
        },
        "DataPointName": "Menstrual Status",
        "position": 6
      },
      {
        "QuestionType": "single_option",
        "settings": {
          "options": [
            {
              "OptionText": "Nu am luat niciodată terapie hormonală (HRT)."
            },
            {
              "OptionText": "În prezent iau terapie hormonală (HRT)."
            },
            {
              "OptionText": "Am luat terapie hormonală (HRT) în trecut."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine experiența ta cu terapia hormonală.",
          "QuestionText": "Ai luat vreodată sau iei în prezent terapie hormonală (HRT)?"
        },
        "DataPointName": "HRT Treatment History",
        "position": 7
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Nu am bufeuri."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ocazional, de câteva ori pe lună."
            },
            {
              "OptionValue": 3,
              "OptionText": "Frecvent, de mai multe ori pe săptămână."
            },
            {
              "OptionValue": 4,
              "OptionText": "Severe, zilnic sau constant pe parcursul zilei și nopții."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de des ai bufeuri.",
          "QuestionText": "Cât de des ai bufeuri?"
        },
        "DataPointName": "Hot Flushes",
        "position": 8
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Nu am transpirații nocturne."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ocazional, de câteva ori pe lună."
            },
            {
              "OptionValue": 3,
              "OptionText": "Frecvent, de mai multe ori pe săptămână."
            },
            {
              "OptionValue": 4,
              "OptionText": "Severe, îmi perturbă somnul aproape în fiecare noapte."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de des ai transpirații nocturne.",
          "QuestionText": "Cât de des ai transpirații nocturne?"
        },
        "DataPointName": "Night Sweats",
        "position": 9
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Nu am palpitații."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ocazional, de câteva ori pe lună."
            },
            {
              "OptionValue": 3,
              "OptionText": "Frecvent, de mai multe ori pe săptămână."
            },
            {
              "OptionValue": 4,
              "OptionText": "Severe, aproape zilnic și deranjante."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de des ai palpitații.",
          "QuestionText": "Cât de des ai palpitații?"
        },
        "DataPointName": "Palpitations",
        "position": 10
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Nu am dureri articulare sau musculare."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ușoare, rigiditate sau disconfort ocazional."
            },
            {
              "OptionValue": 3,
              "OptionText": "Durere frecventă, afectează mișcarea și activitățile zilnice."
            },
            {
              "OptionValue": 4,
              "OptionText": "Durere severă, persistentă, care limitează activitățile."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de des ai disconfort articular sau muscular.",
          "QuestionText": "Cât de des ai dureri articulare sau musculare?"
        },
        "DataPointName": "Joint Pain",
        "position": 11
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Nu am observat nicio creștere în greutate."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ușoară creștere în greutate, dar nu deranjantă."
            },
            {
              "OptionValue": 3,
              "OptionText": "Creștere vizibilă în greutate, afectând încrederea mea."
            },
            {
              "OptionValue": 4,
              "OptionText": "Creștere semnificativă în greutate, dificil de controlat în ciuda eforturilor."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de mult s-a schimbat greutatea ta recent.",
          "QuestionText": "Cât de mult s-a schimbat greutatea ta recent?"
        },
        "DataPointName": "Weight Gain",
        "position": 12
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Nicio schimbare, libidoul meu este la fel."
            },
            {
              "OptionValue": 2,
              "OptionText": "Scădere ușoară, dar încă am interes."
            },
            {
              "OptionValue": 3,
              "OptionText": "Scădere vizibilă, afectează relația mea."
            },
            {
              "OptionValue": 4,
              "OptionText": "Pierderea severă a interesului, aproape niciun interes pentru sex."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de mult s-a schimbat interesul tău pentru sex.",
          "QuestionText": "Cât de mult s-a schimbat interesul tău pentru sex?"
        },
        "DataPointName": "Loss of Interest in Sex",
        "position": 13
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Nu am probleme urinare, totul este normal."
            },
            {
              "OptionValue": 2,
              "OptionText": "Urgență ocazională sau mici pierderi de urină."
            },
            {
              "OptionValue": 3,
              "OptionText": "Scurgeri frecvente sau urgență, afectează viața zilnică."
            },
            {
              "OptionValue": 4,
              "OptionText": "Probleme severe de control al vezicii, impact semnificativ asupra mea."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de des ai probleme urinare (ex. infecții, scurgeri, urgență).",
          "QuestionText": "Cât de des ai probleme urinare precum urgență, scurgeri sau infecții?"
        },
        "DataPointName": "Bladder Problems",
        "position": 14
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Nu am uscăciune sau disconfort vaginal."
            },
            {
              "OptionValue": 2,
              "OptionText": "Uscăciune ușoară ocazională, fără disconfort."
            },
            {
              "OptionValue": 3,
              "OptionText": "Uscăciune vizibilă, dar gestionabilă."
            },
            {
              "OptionValue": 4,
              "OptionText": "Uscăciune frecventă, provocând disconfort."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de mult te-a afectat uscăciunea vaginală.",
          "QuestionText": "Cât de mult te-a afectat uscăciunea vaginală recent?"
        },
        "DataPointName": "Vaginal Dryness",
        "position": 15
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Nicio schimbare, pielea mea este la fel."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ușoară uscăciune sau schimbare de textură."
            },
            {
              "OptionValue": 3,
              "OptionText": "Schimbare moderată, linii fine sau ten tern vizibil."
            },
            {
              "OptionValue": 4,
              "OptionText": "Uscăciune frecventă, pierdere de fermitate."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cum s-a schimbat pielea ta recent.",
          "QuestionText": "Cum s-a schimbat pielea ta recent?"
        },
        "DataPointName": "Declining Skin Quality",
        "position": 16
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Nicio schimbare, părul meu este la fel."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ușoară subțiere sau schimbare de textură."
            },
            {
              "OptionValue": 3,
              "OptionText": "Cădere moderată sau uscăciune crescută."
            },
            {
              "OptionValue": 4,
              "OptionText": "Cădere frecventă, subțiere vizibilă."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cum s-a schimbat părul tău recent.",
          "QuestionText": "Cum s-a schimbat părul tău recent?"
        },
        "DataPointName": "Declining Hair Quality",
        "position": 17
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Rareori mă simt iritabilă."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ocazional, dar gestionabil."
            },
            {
              "OptionValue": 3,
              "OptionText": "Moderat, îmi afectează starea de spirit."
            },
            {
              "OptionValue": 4,
              "OptionText": "Frecvent, afectează relațiile mele."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de des te simți iritabilă.",
          "QuestionText": "Cât de des te simți iritabilă?"
        },
        "DataPointName": "Irritability",
        "position": 18
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Nu am schimbări de dispoziție sau depresie."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ocazional, dar nu îmi afectează viața zilnică."
            },
            {
              "OptionValue": 3,
              "OptionText": "Schimbări moderate de dispoziție, dar gestionabile."
            },
            {
              "OptionValue": 4,
              "OptionText": "Schimbări frecvente de dispoziție, uneori greu de gestionat."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de des experimentezi schimbări de dispoziție sau depresie.",
          "QuestionText": "Cât de des experimentezi schimbări de dispoziție sau depresie?"
        },
        "DataPointName": "Low Mood, Depression, Mood Swings",
        "position": 19
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Rareori mă simt anxioasă."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ocazional, dar nu îmi afectează viața zilnică."
            },
            {
              "OptionValue": 3,
              "OptionText": "Anxietate moderată, dar gestionabilă."
            },
            {
              "OptionValue": 4,
              "OptionText": "Anxietate frecventă, îmi afectează concentrarea și relaxarea."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de des te simți anxioasă sau îngrijorată.",
          "QuestionText": "Cât de des te simți anxioasă sau îngrijorată?"
        },
        "DataPointName": "Anxiety",
        "position": 20
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Dorm bine, fără probleme."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ocazional, dar nu este o preocupare majoră."
            },
            {
              "OptionValue": 3,
              "OptionText": "Probleme moderate de somn, îmi afectează nivelul de energie."
            },
            {
              "OptionValue": 4,
              "OptionText": "Frecvente, mă trezesc adesea obosită."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de des ai probleme cu somnul.",
          "QuestionText": "Cât de des ai probleme cu somnul?"
        },
        "DataPointName": "Sleep Problems",
        "position": 21
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Rareori sau niciodată nu am dureri de cap."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ocazional, dar ușoare."
            },
            {
              "OptionValue": 3,
              "OptionText": "Moderate, dar gestionabile."
            },
            {
              "OptionValue": 4,
              "OptionText": "Frecvente, îmi afectează viața zilnică."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de des ai dureri de cap.",
          "QuestionText": "Cât de des ai dureri de cap?"
        },
        "DataPointName": "Headaches",
        "position": 22
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Nu experimentez probleme cu claritatea mentală."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ocazional, dar nu mă îngrijorează."
            },
            {
              "OptionValue": 3,
              "OptionText": "Moderate, uneori mă simt încetinită mental."
            },
            {
              "OptionValue": 4,
              "OptionText": "Frecvente, îmi afectează concentrarea și memoria."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de des experimentezi probleme de claritate mentală.",
          "QuestionText": "Cât de des experimentezi senzația de „ceață mentală”?"
        },
        "DataPointName": "Brain Fog",
        "position": 23
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Nu am probleme cu memoria."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ocazional, dar nu mă îngrijorează."
            },
            {
              "OptionValue": 3,
              "OptionText": "Moderate, dar gestionabile."
            },
            {
              "OptionValue": 4,
              "OptionText": "Frecvente, îmi afectează viața zilnică."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de des ai probleme de memorie.",
          "QuestionText": "Cât de des ai probleme de memorie?"
        },
        "DataPointName": "Memory Issues",
        "position": 24
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Nu experimentez oboseală."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ocazional, dar ușoară."
            },
            {
              "OptionValue": 3,
              "OptionText": "Moderată, dar gestionabilă."
            },
            {
              "OptionValue": 4,
              "OptionText": "Frecventă, îmi afectează viața zilnică."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de des te simți obosită.",
          "QuestionText": "Cât de des te simți obosită?"
        },
        "DataPointName": "Tiredness & Fatigue",
        "position": 25
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Nicio schimbare, mă simt la fel de puternică."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ușor mai slăbită, dar fără probleme majore."
            },
            {
              "OptionValue": 3,
              "OptionText": "Moderată, dar gestionabilă."
            },
            {
              "OptionValue": 4,
              "OptionText": "Frecventă slăbiciune, îmi afectează activitățile zilnice."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de mult ți-a scăzut forța sau rezistența fizică.",
          "QuestionText": "Cât de mult ți-a scăzut forța sau rezistența fizică?"
        },
        "DataPointName": "Decreased Physical Strength or Stamina",
        "position": 26
      },
      {
        "QuestionType": "scale",
        "settings": {
          "options": [
            {
              "OptionValue": 1,
              "OptionText": "Nu am probleme digestive."
            },
            {
              "OptionValue": 2,
              "OptionText": "Ocazional, dar ușoare."
            },
            {
              "OptionValue": 3,
              "OptionText": "Moderate, dar gestionabile."
            },
            {
              "OptionValue": 4,
              "OptionText": "Frecvente, îmi afectează confortul zilnic."
            }
          ],
          "QuestionHelper": "Alege opțiunea care descrie cel mai bine cât de des experimentezi probleme digestive precum balonare, gaze sau disconfort.",
          "QuestionText": "Cât de des experimentezi probleme digestive precum balonare, gaze sau disconfort?"
        },
        "DataPointName": "DigestiveSymptoms",
        "position": 27
      },
      {
        "QuestionType": "email",
        "settings": {
          "QuestionHelper": "Te rugăm să introduci o adresă de e-mail validă pentru a putea primi rezultatele tale.",
          "QuestionText": "Care este adresa ta de e-mail?"
        },
        "DataPointName": "Email",
        "position": 28
      }
    ]
  }
}
