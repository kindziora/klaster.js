/**
 * 
 * klaster.js by Alexander Kindziora 2014 
 * is a mva (model-view-action) framework for user interfaces
 */
var twigInterface = function (model) {
    var intfc = this;
    localStorage['model'] = JSON.stringify(model);

    this.interactions = {
        bg: {
            click: function (e, self) {
                e.preventDefault();
                $('.lightbox').hide();
            }
        },
        zoom: {
            click: function (e, self) {
                e.preventDefault();
                var $box = $($(this).attr('href'));
                var $img = $box.find('.bigImg');
                $img.attr('src', $img.attr('data-src'));
                $box.show();
            }
        },
        'mark': {
            click: function (e, self) {
                e.preventDefault();
                var $p = $('[data-name="items[' + $(this).attr('data-index') + ']"]');
                $p.toggleClass('marked');

                console.log($p);

                intfc.model.field.results[parseInt($(this).attr('data-index'))] = $p.hasClass('marked');

            }
        }
    };

    this.model = {
        'field': model,
        event: {
            'postChange': {
            },
            sync: function () {
                var result = [];
                for (var i in this.field.items) {
                    result.push({
                        'id': this.field.items[i]['job_id'],
                        'result': !this.field.results[i]
                    });
                }

                console.log(result);

            }
        }
    };

    this.view = {
        templates_: {},
        templates: true,
        viewpath: 'view/twigInterface/',
        fileextension: 'html.twig',
        render: function (tplVars, tplName) {
            return twig({
                data: intfc.view.templates_[tplName || arguments.callee.caller]
            }).render(tplVars);
        },
        views: {
            "foreach->job_similar_tags": function (item, index) {

                return intfc.view.render({'tag': item, 'id': index});
            },
            "foreach->job_image_positive_samples": function (item, index) {
                return intfc.view.render({'img': item, 'id': index});
            },
            "foreach->job_image_negative_samples": function (item, index) {

                return intfc.view.render({'img': item, 'id': index});
            },
            "foreach->items": function (item, index) {
                var match = [];
                var tags = intfc.model.field.job_similar_tags;
                for (var tagId in tags) {
                    if (item.item_description.indexOf(tags[tagId]) !== -1) {
                        match.push(tags[tagId]);
                    }
                }

                return intfc.view.render({'index': index, 'item': item, 'match': match, 'matches': match.join(', ')});
            },
            "job_description": function (item, index) {
                return item;
            }
        },
        event: {
            postRender: {
                "job_description": function () {
                    $('.markedOtherMatch').popover();
                }
            }
        },
        init: function () {
            Twig.extendFilter('encodeURIComponent', function (str) {
                return encodeURIComponent(str);
            });

            Twig.extendFilter('bigImg', function (str) {
                var parts = str.split('-');
                parts[parts.length - 2] = 500;
                return parts.join('-');
            });

        }()
    };

};


var model = {"_id": {"$id": "54da3aa393194fe75e8b45ec"}, "items": [{"job_id": "408841019-7196", "item_id": 408841019, "item_name": "Unisa LANDIS_15_LL, Damen Peep-Toe Pumps, Silber (SILVER), 38 EU", "item_description": "Unisa LANDIS_15_LL, Damen Peep-Toe Pumps, Silber (SILVER), 38 EU", "item_external_category": "[topCategory:Mode & Schuhe  > Schuhe  > Damenschuhe  > Pumps][category:Pumps][brand:unisa]", "item_brand_name": "unisa", "image_url": "http:\/\/de1.vmstatic.com\/unisa-landis-15-ll-damen-peep-toe-pumps-silber-silver-38-eu-408841019-0-150-04.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "408841021-7196", "item_id": 408841021, "item_name": "Unisa LANDIS_15_LL, Damen Peep-Toe Pumps, Silber (SILVER), 37 EU", "item_description": "Unisa LANDIS_15_LL, Damen Peep-Toe Pumps, Silber (SILVER), 37 EU", "item_external_category": "[topCategory:Mode & Schuhe  > Schuhe  > Damenschuhe  > Pumps][category:Pumps][brand:unisa]", "item_brand_name": "unisa", "image_url": "http:\/\/de1.vmstatic.com\/unisa-landis-15-ll-damen-peep-toe-pumps-silber-silver-37-eu-408841021-0-150-04.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "408841743-7196", "item_id": 408841743, "item_name": "s.Oliver 28337, Damen Peep-Toe Pumps, Braun (Pepper 324), 38 EU (5 Damen UK)", "item_description": "s.Oliver 28337, Damen Peep-Toe Pumps, Braun (Pepper 324), 38 EU (5 Damen UK)", "item_external_category": "[topCategory:Mode & Schuhe  > Schuhe  > Damenschuhe  > Pumps][category:Pumps][brand:s.oliver]", "item_brand_name": "s.oliver", "image_url": "http:\/\/de2.vmstatic.com\/s-oliver-28337-damen-peep-toe-pumps-braun-pepper-324-38-eu-5-damen-uk-408841743-0-150-04.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "408841744-7196", "item_id": 408841744, "item_name": "s.Oliver 28337, Damen Peep-Toe Pumps, Braun (Pepper 324), 37 EU (4 Damen UK)", "item_description": "s.Oliver 28337, Damen Peep-Toe Pumps, Braun (Pepper 324), 37 EU (4 Damen UK)", "item_external_category": "[topCategory:Mode & Schuhe  > Schuhe  > Damenschuhe  > Pumps][category:Pumps][brand:s.oliver]", "item_brand_name": "s.oliver", "image_url": "http:\/\/de3.vmstatic.com\/s-oliver-28337-damen-peep-toe-pumps-braun-pepper-324-37-eu-4-damen-uk-408841744-0-150-04.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "408841747-7196", "item_id": 408841747, "item_name": "s.Oliver 28337, Damen Peep-Toe Pumps, Braun (Pepper 324), 36 EU (3.5 Damen UK)", "item_description": "s.Oliver 28337, Damen Peep-Toe Pumps, Braun (Pepper 324), 36 EU (3.5 Damen UK)", "item_external_category": "[topCategory:Mode & Schuhe  > Schuhe  > Damenschuhe  > Pumps][category:Pumps][brand:s.oliver]", "item_brand_name": "s.oliver", "image_url": "http:\/\/de2.vmstatic.com\/s-oliver-28337-damen-peep-toe-pumps-braun-pepper-324-36-eu-3-5-damen-uk-408841747-0-150-04.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "408850022-7196", "item_id": 408850022, "item_name": "Unisa TONIA_LL_KS, Damen Peep-Toe Pumps, Mehrfarbig (BROZE\/LODO), 36 EU", "item_description": "Unisa TONIA_LL_KS, Damen Peep-Toe Pumps, Mehrfarbig (BROZE\/LODO), 36 EU", "item_external_category": "[topCategory:Mode & Schuhe  > Schuhe  > Damenschuhe  > Pumps][category:Pumps][brand:unisa]", "item_brand_name": "unisa", "image_url": "http:\/\/de1.vmstatic.com\/unisa-tonia-ll-ks-damen-peep-toe-pumps-mehrfarbig-broze-lodo-36-eu-408850022-0-150-04.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "408858273-7196", "item_id": 408858273, "item_name": "Guess Peeptoe Pumps 41, tan", "item_description": "guess Peeptoe", "item_external_category": "[topCategory:Shoes][ean:0887347807604][size:41][color:Tan][brand:guess][auxiliary:v3_shoes_mp]", "item_brand_name": "guess", "image_url": "http:\/\/de2.vmstatic.com\/guess-peeptoe-pumps-41-tan-408858273-0-150-04.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "408862502-7196", "item_id": 408862502, "item_name": "Tamaris 29300, Damen Peep-Toe Pumps, Mehrfarbig (Flower Comb 908), 42 EU (8 Damen UK)", "item_description": "Die schwarz-bunten Tamaris Pumps Modell Furbara \u00fcberzeugen mit blumigem Design und lassen Sie mit Ihrem stylisch femininen Schuh zum Eyecatcher werden. Modell: Furbara, Farbe: flower comb., Obermaterial: Textil in Velouroptik, Innen: Textil, Absatz: ca. 9cm", "item_external_category": "[topCategory:Mode & Schuhe  > Schuhe  > Damenschuhe  > Pumps][category:Pumps][brand:tamaris]", "item_brand_name": "tamaris", "image_url": "http:\/\/de3.vmstatic.com\/tamaris-29300-damen-peep-toe-pumps-mehrfarbig-flower-comb-908-42-eu-8-damen-uk-408862502-0-150-04.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "409366806-7196", "item_id": 409366806, "item_name": "Badgley Mischka Goodie Damen Rosa Peep Zehe Textile Pumps Schuhe Neu EU 38", "item_description": "The Badgley Mischka Goodie shoes feature a textile upper with a peep toe. The leather outsole lends lasting traction and wear.", "item_external_category": "[color:Crnsat][brand:badgley mischka][ean:0749908575080][auxiliary:v3_shoes_mp][topCategory:Shoes][size:38]", "item_brand_name": "badgley mischka", "image_url": "http:\/\/de3.vmstatic.com\/badgley-mischka-goodie-damen-rosa-peep-zehe-textile-pumps-schuhe-neu-eu-38-409366806-0-150-04.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "409370817-7196", "item_id": 409370817, "item_name": "Nina Criana Damen Natur Peep Zehe Textile Pumps Schuhe Gre Neu EU 35,5", "item_description": "The Nina Criana shoes feature a fabric upper with a peep toe. The leather outsole lends lasting traction and wear. Made in China.", "item_external_category": "[ean:0093412922534][auxiliary:v3_shoes_mp][brand:nina][topCategory:Shoes][color:Ivory Luster][size:35.5]", "item_brand_name": "nina", "image_url": "http:\/\/de2.vmstatic.com\/nina-criana-damen-natur-peep-zehe-textile-pumps-schuhe-gre-neu-eu-35-5-409370817-0-150-04.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "409440009-7196", "item_id": 409440009, "item_name": "OSCO 2649A Keilpump khaki", "item_description": "Obermaterial: Kunstleder Futter: Kunstleder Farbe: camel,khaki,schwarz,gr\u00fcn,rot,wei\u00df Abstatz-Stil: Keilabsatz Verschluss: Schlupf\/Offen Art: Keilpumps, Peep Toes", "item_external_category": "[topCategory:Mode & Schuhe  > Schuhe  > Damenschuhe  > Pumps][brand:osco][category:Pumps]", "item_brand_name": "osco", "image_url": "http:\/\/de1.vmstatic.com\/osco-2649a-keilpump-khaki-409440009-0-150-04.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "409440018-7196", "item_id": 409440018, "item_name": "OSCO 2971 High-Heels\/Peeptoes green", "item_description": "Obermaterial:Kunstleder\/Textil Farbe: Schwarz,Gr\u00fcn,Fushia,Silber Verschluss:Schlupf\/Offen Absatzh\u00f6he: 13,5 cm (einfach gemessen) Plateuh\u00f6he 4,0 cm (einfach gemessen) Stil: High-Heels\/Peeptoes", "item_external_category": "[topCategory:Mode & Schuhe  > Schuhe  > Damenschuhe  > Pumps][brand:osco][category:Pumps]", "item_brand_name": "osco", "image_url": "http:\/\/de1.vmstatic.com\/osco-2971-high-heels-peeptoes-green-409440018-0-150-04.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "409440233-7196", "item_id": 409440233, "item_name": "OSCO L-387 High Heels\/Peeptoes rot", "item_description": "Farbe:schwarz,rot,beige Absatzh\u00f6he: ca.14,5 cm (gemessen an Gr\u00f6\u00dfe 37) Plateauh\u00f6he: ca. 4,0 cm (gemessen an Gr\u00f6\u00dfe 37) Obermaterial: Textil Stil: High Heels\/Peep Toe", "item_external_category": "[topCategory:Mode & Schuhe  > Schuhe  > Damenschuhe  > Pumps][brand:osco][category:Pumps]", "item_brand_name": "osco", "image_url": "http:\/\/de1.vmstatic.com\/osco-l-387-high-heels-peeptoes-rot-409440233-0-150-04.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "409588445-7196", "item_id": 409588445, "item_name": "Pumps aus Veloursleder mit Schleife - rose", "item_description": "Sommerliche Partner der femininen Garderobe: die Pumps aus Veloursleder mit Schleife - durch zarte Pastells ein sommerliches Must Have. Die Zierschleife aus schimmerndem Leder gibt den Pumps das verspielte Extra. Ein femininer Peeptoe, handgefertigt in Spanien! Durch den etwas breiteren Absatz perfekt auch an l\u00e4ngeren Tagen!  Lederfutter, Lederdecksohle, flexible Laufsohle Absatz in Gr\u00f6\u00dfe 37 ca. 8 cm hoch.", "item_external_category": "[topCategory:Fashion][category:Damenmode&gt;Schuhe & Accessoires&gt;Schuhe&gt;Pumps][ean:06629866][brand:madeleine][size:36,37,38,39,40,41]", "item_brand_name": "madeleine", "image_url": "http:\/\/de2.vmstatic.com\/pumps-aus-veloursleder-mit-schleife-rose-409588445-0-150-04.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "70221747-7196", "item_id": 70221747, "item_name": "PleaserUSA PinUp Couture Plateau-Pumps Lolita-10", "item_description": "Open-Toe-Pumps im edlen Velourleder-Design. Mit feiner Applikation auf der Schuhspitze.", "item_external_category": "[size:39 EU \/ 9 US][topCategory:Shoes][auxiliary:v3_shoes_mp][ean:0885487492162][color:Schwarz][brand:pinup couture]", "item_brand_name": "pinup couture", "image_url": "http:\/\/de2.vmstatic.com\/pleaserusa-pinup-couture-plateau-pumps-lolita-10-70221747-0-150-18.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "72385883-7196", "item_id": 72385883, "item_name": "Menbur High Heel Peeptoe ivory", "item_description": "Ganz in Wei\u00df, mit einem Blumenstrau\u00df - beim Anblick dieser zauberhaften Plateau-Peeptoes m\u00f6chte man am liebsten augenblicklich vor den n\u00e4chsten Altar schreiten, nur um diese traumhaften Schuhe geb\u00fchrend auszuf\u00fchren! Aber auch abseits aller Hochzeitszeremonien machen diese Peeptoes jede Menge her und verzaubern uns mit ihren sanften Creme-Ton und den funkelnden Strass-Applikationen.", "item_external_category": "[gender:Damen][ean:8433411730525][category:High Heels][category_2:Peeptoes][topCategory:Schuhe][color:grau][size:40, 41][material:Satin][brand:menbur]", "item_brand_name": "menbur", "image_url": "http:\/\/de3.vmstatic.com\/menbur-high-heel-peeptoe-ivory-72385883-0-150-0D.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "77439811-7196", "item_id": 77439811, "item_name": "House of Harlow 1960 - Damen - Leigh - Pumps - blau", "item_description": "House of Harlow 1960 - Pumps f\u00fcr Damen , verf\u00fcgbar in Gr. 36 1\/2|38 1\/2|39 1\/2 ., Material: Leder, Farbe: blau, Stil: Peeptoe City Sexy Shoes   Peeptoe", "item_external_category": "[brand:house of harlow 1960][size:36 1\/2|38 1\/2|39 1\/2][color:blau][topCategory:Pumps f\u00fcr Damen][material:Leder][category:Peeptoe][gender:Damen][heelHeight:14 cm]", "item_brand_name": "house of harlow 1960", "image_url": "http:\/\/de1.vmstatic.com\/house-of-harlow-1960-damen-leigh-pumps-blau-77439811-0-150-65.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "85095419-7196", "item_id": 85095419, "item_name": "Ravel - Damen - JUMP - Pumps - blau", "item_description": "Ravel - Pumps f\u00fcr Damen , verf\u00fcgbar in Gr. 37|38|39 ., Material: Nubukleder, Farbe: blau, Stil: Peeptoe City    Peeptoe", "item_external_category": "[brand:ravel][size:37|38|39][color:blau][topCategory:Pumps f\u00fcr Damen][material:Nubukleder][category:Peeptoe][gender:Damen][heelHeight:13 cm]", "item_brand_name": "ravel", "image_url": "http:\/\/de2.vmstatic.com\/ravel-damen-jump-pumps-blau-85095419-0-150-65.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "93680815-7196", "item_id": 93680815, "item_name": "1 to 3 Plateau Pumps NINA 11003 black 40", "item_description": "Superschicke Plateau-Pumps vom spanischen Brand 1 to 3 in klassischem Schwarz. Diese modischen Peeptoes sind dank der doppelst\u00f6ckigen Plateausohle und des schlanken Stiletto-Absatzes ein absoluter Eyecatcher! > Marke: 1 to 3 > Zierschleife > Schuhspitze: offen > Verschluss: Riemchen > Sohlenform: Plateausohle > Plateauh\u00f6he: 4 cm > Absatzform: Stiletto > Absatzh\u00f6he: 15 cm > gepolstertes Fu\u00dfbett > Obermaterial: Textil > Innenmaterial: Leder, Synthetik > Laufsohle: Synthetik ", "item_external_category": "[color:Black][ean:4493976683500][brand:1 to 3][auxiliary:v3_shoes_mp][size:40][category:Schuhe & Handtaschen\/Kategorien\/Schuhe\/Damen\/Pumps][topCategory:Shoes]", "item_brand_name": "1 to 3", "image_url": "http:\/\/de1.vmstatic.com\/1-to-3-plateau-pumps-nina-11003-black-40-93680815-0-150-1D.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "111777342-7196", "item_id": 111777342, "item_name": "Burlesque Peep Toe Pumps Ava schwarz-rot - Gr. 36", "item_description": "Diese extravaganten Peep Toes der Marke Betti Page von Ellie Shoes aus USA sind ein echter Trendsetter und idealer Kombi-Partner f\u00fcr modebewusste Frauen, die stilvoll auftreten wollen!!  Hollywood-Stars wie Ava Gardner und Rita Hayworth haben sie in den 30er-Jahren ber\u00fchmt gemacht - jetzt feiern die femininen Plateau Pumps mit erotischer Zehen\u00f6ffnung ein sensationelles Comeback. Der edle schwarze High Heel aus weichem Textilstoff kombiniert mit Lack-Zierborde entlang des Schuhs und auffallenden roten R\u00fcschen ist ein raffinierter Mix aus sexy Sandale und elegantem Pumps und setzt jedes Outfit perfekt in Szene. Vorne ist der edle Peep Toe mit einer auff\u00e4lligen roten gro\u00dfen Schleife verziert und besticht dar\u00fcber hinaus mit weiteren Highlights wie den roten Satinband- und R\u00fcschenverzierungen au\u00dfen, der schwarzen T\u00fcllr\u00fcsche innen sowie dem Pfennigabsatz, mit dem Sie garantiert einen bleibenden Eindruck hinterlassen. Ein edles Modell in hochwertiger Verarbeitung mit dem Sie jederzeit einen unvergesslichen Auftritt haben.  Absatzh\u00f6he: 10 cm. Farbe: Schwarz-Rot.", "item_external_category": "[brand:unbekannt][auxiliary:v3_shoes_mp][size:36][color:Schwarz-Rot][topCategory:Shoes]", "item_brand_name": "unbekannt", "image_url": "http:\/\/de2.vmstatic.com\/burlesque-peep-toe-pumps-ava-schwarz-rot-gr-36-111777342-0-150-15.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "115518814-7196", "item_id": 115518814, "item_name": "Ironfist Peeptoes Slow Dance Platforms Black 37", "item_description": "Supers\u00fc\u00dfe Ballerinas mit schickem Alloverprint. Ein echter Eyecatcher-Schuh. L\u00e4\u00dft sich toll kombinieren. Made by Iron Fist with love for a heartless world. > Marke: Iron Fist > Detail: Alloverprint > Verschluss: Schlupfschuh > Schuhspitze: rund > Absatzform: Ballerina > Absatzh\u00f6he: unter 1cm > Obermaterial: Textil > Innenmaterial: Synthetik > leicht gepolstertes Fu\u00dfbett > Laufsohle: Kunststoff ", "item_external_category": "[brand:iron fist][size:37][topCategory:Shoes][category:Schuhe & Handtaschen\/Kategorien\/Schuhe\/Damen\/Pumps][auxiliary:v3_shoes_mp][color:Black][ean:4494016851408]", "item_brand_name": "iron fist", "image_url": "http:\/\/de1.vmstatic.com\/ironfist-peeptoes-slow-dance-platforms-black-37-115518814-0-150-18.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "115751571-7196", "item_id": 115751571, "item_name": "Pumps Peeptoes von Apart aus Leder - Dunkellila Gr. 37", "item_description": "Aus hochwertigem Veloursleder (Obermaterial).Innensohle und Innenfutter aus Leder. Flexible Laufsohle. Absatzh\u00f6he ca. 9 cm.", "item_external_category": "[brand:apart][auxiliary:v3_shoes_mp][topCategory:Shoes][color:Dunkellila][ean:4250472274829][size:37]", "item_brand_name": "apart", "image_url": "http:\/\/de2.vmstatic.com\/pumps-peeptoes-von-apart-aus-leder-dunkellila-gr-37-115751571-0-150-18.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "131922775-7196", "item_id": 131922775, "item_name": "Iron Fist Schuhe - Pumps Birds Of A Feather - Black, Gr&ouml;&szlig;e:40", "item_description": "Iron Fist - Plateau Pumps   Model: Birds of a Feather   Absatzh\u00f6he: 12 cm   Obermaterial: Synthetik   Innenmaterial: Synthetik   Sohle: PVC  ", "item_external_category": "[topCategory:Shoes][auxiliary:v3_shoes_mp][color:Schwarz][brand:iron fist][size:39][ean:5052414054754]", "item_brand_name": "iron fist", "image_url": "http:\/\/de1.vmstatic.com\/iron-fist-schuhe-pumps-birds-of-a-feather-black-groesse-40-131922775-0-150-1D.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "145357914-7196", "item_id": 145357914, "item_name": "BLASE' Peeptoe Pumps", "item_description": "Tuch Lam\u00e9-Look Kontrastn\u00e4hte Schleife Ledersohle Peeptoes Pumps", "item_external_category": "[brand:blase'][topCategory:SCHUHE][category:Peeptoe Pumps][size:35,36.5][gender:Woman][material:Gewebefasern][color:Silber]", "item_brand_name": "blase'", "image_url": "http:\/\/de2.vmstatic.com\/blase-peeptoe-pumps-145357914-0-150-42.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}, {"job_id": "150606173-7196", "item_id": 150606173, "item_name": "IronFist Peep-Toe Plateau-Pumps LOVE BITES leopard 41", "item_description": "IronFist Peep-Toe Plateau-Pumps LOVE BITES leopard 41", "item_external_category": "[category:Schuhe & Handtaschen\/Kategorien\/Schuhe\/Damen\/Pumps][ean:4493897477301][auxiliary:v3_shoes_mp][brand:iron fist][topCategory:Shoes][color:Leopard][size:41]", "item_brand_name": "iron fist", "image_url": "http:\/\/de3.vmstatic.com\/ironfist-peep-toe-plateau-pumps-love-bites-leopard-41-150606173-0-150-15.jpg", "language": "de", "tag_id": 7196, "tag_name": "Peeptoe Pumps"}], "job_image_positive_samples": ["http:\/\/de2.vmstatic.com\/image-366561241-0-150-14.jpg", "http:\/\/de1.vmstatic.com\/image-400220770-0-150-20.jpg", "http:\/\/de1.vmstatic.com\/image-357896015-0-150-14.jpg"], "job_image_negative_samples": ["http:\/\/de1.vmstatic.com\/image-108321399-0-150-00.jpg", "http:\/\/de2.vmstatic.com\/image-372463977-0-150-14.jpg", "http:\/\/de3.vmstatic.com\/image-407568416-0-150-07.jpg"], "job_description": "\n\t\t\tDer Pump ist ein weit ausgeschnittener, aber in sich meist geschlossener Halbschuh (bis zum Knochenh\u00f6ckel ohne Verschluss), hat meist eine flache Sohle und einen \"\"formvariierenden\"\" Absatz (~3cm)\n\n\t\t\t- Peeptoe\n\t\t\t\t- an der Schuhspitze mit einer kleinen \u00d6ffnung f\u00fcr die Zehen\n\t\t\t\t- solange die Zehen nur andeutungsweise zu sehen sind\n\t\t\t\t- keine Schn\u00fcrsenkel\n\t\t\t\t- keine Rei\u00dfverschl\u00fcsse\n\t\t\t\t- kein Elastikband zum schn\u00fcren oder \u00e4hnliches", "job_similar_tags": {"42": "Mary-Jane Pumps", "44": "Slingback", "45": "T-Steg", "46": "Hochfrontpumps", "845": "Brautschuhe", "7197": "Plateaupumps", "7198": "Keilabsatz-Pumps", "7204": "Highheel-Pumps", "7205": "Stiletto-Pumps", "21338": "Lederpumps", "22212": "Trotteur", "22270": "Spangenpumps", "22933": "Schn\u00fcrpumps", "26925": "Lackpumps", "27452": "Abendpumps", "28018": "Keilpumps", "28861": "Riemchenpumps", "34271": "Cap Toe", "40391": "Flamencopumps", "103603": "Kitten Heels", "106621": "College Pumps", "108837": "Pumps mit Blockabsatz", "110092": "Party-Pumps", "111280": "spitze Pumps", "111604": "Glitzer Pumps", "112942": "Pumps mit Nieten", "118366": "Retro Pumps", "120541": "Trachtenpumps", "209472": "klassische Pumps", "231500": "Loafer Pumps", "289938": "Strass Pumps", "341218": "Sky Heels"}, "meta": {"created_at": {"sec": 1423588003, "usec": 957000}, "ttl": {"sec": 1423588003, "usec": 957000}, "qm_status": 1, "id": 119}};

model.tag_name = model.items[0].tag_name;
model.results = [];
var mytodos = new twigInterface(model);
$('#todoapp').klaster_(mytodos);

 