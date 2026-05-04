/** Inlined HTML template — Supabase Edge Functions only bundle imported modules, not runtime file reads. */
export const REPORT_HTML_TEMPLATE = `<html>
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<style>
			:root {
			  --main-blue: #3D497A;
			  --main-blue-hover: #2C355A;
			  --main-grey: #949494;
			  --main-pink: #FF4589;
			  --secondary-gray: #EAECF0;
			  --secondary-blue-80: #646D95;
			  --secondary-blue-20: #D8DBE4;
			  --secondary-blue: #f5f6f8;
			  --tint-stone-50: #D8E1DF;
			}
			@font-face {
			  font-family:"SofiaPro-Medium";
			  src:url("https://use.typekit.net/af/19ced7/00000000000000007735f992/30/l?primer=fff1a989570eb474b8c22c57cc7199e63bfc7e911b750165d0199218f0b7e7cc&fvd=n5&v=3") format("woff2"),
			  url("https://use.typekit.net/af/19ced7/00000000000000007735f992/30/d?primer=fff1a989570eb474b8c22c57cc7199e63bfc7e911b750165d0199218f0b7e7cc&fvd=n5&v=3") format("woff"),
			  url("https://use.typekit.net/af/19ced7/00000000000000007735f992/30/a?primer=fff1a989570eb474b8c22c57cc7199e63bfc7e911b750165d0199218f0b7e7cc&fvd=n5&v=3") format("opentype");
			  font-display:auto;
			  font-style:normal;
			  font-weight:500;
			  font-stretch:normal;
			}
			@page {
				size: 1280px auto;
				margin: 40px 0;

			}
			body {
				width: 1280px;
				margin: 0;
				padding: 0;
			}
			.main-container {
				margin: 0;
				padding: 0;
				width: 100%;
			}

			@font-face {
			  font-family:"SofiaPro-Regular";
			  src:url("https://use.typekit.net/af/b718ff/00000000000000007735f98d/30/l?primer=fff1a989570eb474b8c22c57cc7199e63bfc7e911b750165d0199218f0b7e7cc&fvd=n4&v=3") format("woff2"),
			  url("https://use.typekit.net/af/b718ff/00000000000000007735f98d/30/d?primer=fff1a989570eb474b8c22c57cc7199e63bfc7e911b750165d0199218f0b7e7cc&fvd=n4&v=3") format("woff"),
			  url("https://use.typekit.net/af/b718ff/00000000000000007735f98d/30/a?primer=fff1a989570eb474b8c22c57cc7199e63bfc7e911b750165d0199218f0b7e7cc&fvd=n4&v=3") format("opentype");
			  font-display:auto;
			  font-style:normal;
			  font-weight:400;
			  font-stretch:normal;
			}

			@font-face {
			  font-family:"SofiaPro-SemiBold";
			  src:url("https://use.typekit.net/af/262452/00000000000000007735f99a/30/l?primer=fff1a989570eb474b8c22c57cc7199e63bfc7e911b750165d0199218f0b7e7cc&fvd=n6&v=3") format("woff2"),
			  url("https://use.typekit.net/af/262452/00000000000000007735f99a/30/d?primer=fff1a989570eb474b8c22c57cc7199e63bfc7e911b750165d0199218f0b7e7cc&fvd=n6&v=3") format("woff"),
			  url("https://use.typekit.net/af/262452/00000000000000007735f99a/30/a?primer=fff1a989570eb474b8c22c57cc7199e63bfc7e911b750165d0199218f0b7e7cc&fvd=n6&v=3") format("opentype");
			  font-display:auto;
			  font-style:normal;
			  font-weight:600;
			  font-stretch:normal;
			}
			body{
				margin: 0;
				padding: 0;
			}
			.meno-score-container{
			  width: 100%;
			  display: flex;
			  justify-content: flex-start;
			  flex-direction: column;
			  row-gap: 32px;
			  padding-right: 60px;
			  width: 640px;
			}
			.meno-stage{
			  max-width: 640px;
			  height: auto;
			}
			.meno-stage .meno-stage-prehead{
			  font-family: "SofiaPro-Medium";
			  color: var(--main-grey);
			  font-size: 14px;
			  font-style: normal;
			  font-weight: 500;
			  line-height: 20px; /* 142.857% */
			  letter-spacing: -0.42px;
			  max-width: 640px;
			}
			.symptoms-prehead{
			  font-family: "SofiaPro-Medium";
			  color: var(--main-grey);
			  font-size: 14px;
			  font-style: normal;
			  font-weight: 500;
			  line-height: 20px; /* 142.857% */
			  letter-spacing: -0.42px;
			  max-width: 640px;
			}
			.meno-stage-main-content{
			  margin: 0 0 32px 0;
			  display: flex;
			  column-gap: 64px;
			  align-items: flex-start;
			}
			.meno-score-container .meno-stage-scale{
			  display: flex;
			  flex-direction: row;
			  flex-wrap: wrap;
			  width: calc(100% - 64px);
			  padding: 48px 32px 32px;
			  border: 1px solid var(--secondary-blue-20);
			  border-radius: 16px;
			  position: relative;
			  max-width: 576px;
			}
			.meno-score-container .meno-stage-scale .meno-stage-scale-container{
			  width: 100%;
			  position: relative;
			  display: flex;
			  justify-content: flex-start;
			  align-items: flex-start;
			  height: 48px;
			}
			.meno-score-container .meno-stage-scale .arrow{
			  transform: rotate(-90deg);
			  position: absolute;
			  top: 7px;
			  left: 0;
			  transition: left 2s linear;
			}
			.meno-score-container .meno-stage-scale .top-arrow{
			  position: absolute;
			  right: 0;
			  top: -7px;
			}
			.meno-score-container .meno-stage-scale .arrow.d-none{
			  display: none;
			}
			.meno-score-container .meno-stage-scale .item{
			  color: var(--main-grey);
			  font-family: "SofiaPro-Regular";
			  font-size: 14px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 20px;
			  letter-spacing: -0.42px;
			  overflow: visible;
			  position: absolute;
			  width: 12px;
			  top: 0;
			  padding-top: 26px;
			  text-align: center;
			}
			.meno-score-container .meno-stage-scale .item.active{
			  color: var(--main-blue);
			}
			.meno-score-container .meno-stage-scale .item:before{
			  content: '';
			  position: absolute;
			  left: 50%;
			  transform: translateX(-50%);
			  top: -4px;
			  width: 12px;
			  height: 12px;
			  border-radius: 100%;
			  background-color: var(--secondary-blue-20);
			  transition: background-color 0.2s linear;
			}
			.meno-score-container .meno-stage-scale .item.active:before{
			  background-color: var(--main-blue);
			  transition: background-color 0.2s linear;
			}
			.meno-score-container .meno-stage-scale .item.item1{
			  left: 64px;
			}
			.meno-score-container .meno-stage-scale .item.item2{
			  left: 64px;
			}
			.meno-score-container .meno-stage-scale .item.item1.active:before{
			  transition-delay: 0s;
			}
			.meno-score-container .meno-stage-scale .item.item2.active:before{
			  transition-delay: 750ms;
			}
			.meno-score-container .meno-stage-scale .item.item3.active:before{
			  transition-delay: 1500ms;
			}
			.meno-score-container .meno-stage-scale .item.item4.active:before{
			  transition-delay: 1800ms;
			}
			.meno-score-container .meno-stage-text{
			  flex: 1;
			}
			.meno-score-container .meno-stage-text .meno-stage-prehead{
			  font-family: "SofiaPro-Medium";
			  color: var(--main-grey);
			  font-size: 14px;
			  font-style: normal;
			  font-weight: 500;
			  line-height: 20px;
			  letter-spacing: -0.42px;
			}
			.meno-score-container .meno-stage-scale .line-small{
			  width: 60px;
			  height: 4px;
			  background-color: var(--secondary-blue-20);
			  position: relative;
			  border-radius: 24px;
			  left: 0;
			}
			.meno-score-container .meno-stage-scale .line-big{
			  width: calc((100% - 200px)/3);
			  height: 4px;
			  background-color: var(--secondary-blue-20);
			  position: relative;
			  border-radius: 24px;
			  left: 20px;
			  top: 0;
			}
			.meno-score-container .meno-stage-scale .line-small span,
			.meno-score-container .meno-stage-scale .line-big span{
			  height: 100%;
			  width: 0;
			  bottom: 0;
			  position: absolute;
			  background-color: var(--secondary-blue-80);
			  transition: width 0.5s linear;
			  border-radius: 24px;
			}
			.meno-score-container .meno-stage-scale .line-big span.active{
			  transition: width 0.5s linear;
			  width: 100%
			}
			.meno-score-container .meno-stage-scale .line-small span.active{
			  transition: width 0.25s linear;
			  width: 100%
			}
			.meno-stage-main-content .meno-stage-text .meno-stage-title{
			  color: var(--main-blue);
			  font-family: "SofiaPro-Medium";
			  font-size: 24px;
			  font-style: normal;
			  font-weight: 500;
			  line-height: 32px;
			  letter-spacing: -0.72px;
			  margin: 0 0 24px;
			}
			.meno-stage-main-content .meno-stage-text .meno-stage-description{
			  color: var(--main-blue);
			  font-family: "SofiaPro-Regular";
			  font-size: 16px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 24px; /* 150% */
			  letter-spacing: -0.16px;
			}
			.meno-stage-description p{
			  color: var(--main-blue);
			  font-family: "SofiaPro-Regular";
			  font-size: 16px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 24px; /* 150% */
			  letter-spacing: -0.16px;
			  margin: 0 0 24px 0;
			}
			.meno-stage-description p:last-child{
			  margin: 0;
			}
			.meno-stage-main-content .meno-stage-text .meno-stage-description a{
			  color: var(--main-blue);
			  font-family: "SofiaPro-Regular";
			  font-size: 16px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 24px; /* 150% */
			  letter-spacing: -0.16px;
			  text-decoration: underline;
			}
			.meno-score .meno-stage-stats,
			.meno-stage .meno-stage-stats{
			  border-radius: 16px;
			  background-color: #F5F6F8;
			  padding: 24px;
			  display: flex;
			  flex-direction: column;
			  justify-content: flex-start;
			  align-items: flex-start;
			  gap: 8px;
			  margin-bottom: 32px;
			}
			.meno-score .meno-stage-stats .percent,
			.meno-stage .meno-stage-stats .percent{
			  color: var(--main-blue);
			  font-family: "SofiaPro-Medium";
			  font-size: 28px;
			  font-style: normal;
			  font-weight: 500;
			  line-height: 36px; /* 128.571% */
			  letter-spacing: -0.84px;
			}
			.meno-score .meno-stage-stats .text,
			.meno-score .meno-stage-stats .text a,
			.meno-stage .meno-stage-stats .text,
			.meno-stage .meno-stage-stats .text a{
			  color: var(--main-blue);
			  font-family: "SofiaPro-Regular";
			  font-size: 14px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 20px;
			  letter-spacing: -0.42px;
			}
			.meno-score .meno-stage-stats .text a,
			.meno-stage .meno-stage-stats .text a{
			  text-decoration-line: underline;
			  text-decoration-style: solid;
			  text-decoration-skip-ink: none;
			  text-decoration-thickness: auto;
			  text-underline-offset: auto;
			  text-underline-position: from-font;
			}
			.meno-stage-explanation{
			  color: var(--main-grey);
			  font-family: "SofiaPro-Regular";
			  font-size: 12px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 18px;
			  letter-spacing: -0.18px;
			  margin: 0;
			  padding-bottom: 48px;
			  border-bottom: 1px solid #D8DBE4;
			}
			/* Dividers lived on removed .meno-stage-explanation; apply to section blocks instead */
			.meno-score-container > div.meno-stage{
			  border-bottom: 1px solid #D8DBE4;
			  padding-bottom: 48px;
			}
			.meno-score-container > .meno-score{
			  border-bottom: 1px solid #D8DBE4;
			  padding-bottom: 48px;
			}
			.meno-score .meno-stage-action-buttons,
			.meno-stage .meno-stage-action-buttons{
			  display: flex;
			  flex-direction: row;
			  flex-wrap: wrap;
			  gap: 16px;
			  margin-bottom: 48px;
			}
			.meno-score .meno-stage-action-buttons.meno-score-action-buttons{
			  margin-bottom: 32px;
			  margin-top: 32px;
			}
			.meno-stage .meno-stage-action-buttons .button,
			.meno-score .meno-stage-action-buttons .button{
			  font-size: 14px;
			  line-height: 20px;
			  padding: 8px 16px 8px 24px;
			}
			.meno-score{
			  max-width: 640px;
			  height: auto;
			  margin-top: 16px;
			}
			.meno-score .score-circle{
			  margin-bottom: 32px;
			}
			.meno-score .score-circle text{
			  color: var(--main-blue);
			  font-family: "SofiaPro-SemiBold";
			  font-size: 36px;
			  font-style: normal;
			  font-weight: 700;
			  line-height: 38px; /* 105.556% */
			  letter-spacing: -0.36px;
			}
			.meno-score .score-circle text:last-of-type{
			  font-size: 14px;
			  line-height: 28px;
			  letter-spacing: -0.21px;
			}
			#symptoms{
			  margin-top: 32px;
			}
			#symptoms.d-none{
			  display: none;
			}
			#symptoms .intro{
			  margin-bottom: 64px;
			}
			#symptoms .intro h2{
			  color: var(--main-blue);
			  font-family: "SofiaPro-Medium";
			  font-size: 24px;
			  font-style: normal;
			  font-weight: 500;
			  line-height: 32px; /* 133.333% */
			  letter-spacing: -0.72px;
			  margin: 0 0 16px 0;
			}
			#symptoms .intro .intro-text{
			  color: var(--main-blue);
			  font-family: "SofiaPro-Regular";
			  font-size: 18px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 28px; /* 155.556% */
			  letter-spacing: -0.54px;
			}
			#symptoms .action-buttons{
			  display: flex;
			  gap: 8px;
			  background-color: #FFF;
			  padding: 32px 0 24px 0;
			  position: sticky;
			  top: 0;
			}
			#symptoms  .action-buttons .button{
			  font-family: "SofiaPro-Medium";
			  padding: 8px 24px;
			  font-size: 16px;
			  font-style: normal;
			  font-weight: 500;
			  line-height: 24px; /* 150% */
			  letter-spacing: -0.24px;
			  outline: 0;
			}
			#symptoms  .action-buttons .button.button--secondary{
			  border: 1px solid var(--main-blue);
			  color: var(--main-blue);
			}
			#symptoms  .action-buttons .button.button--secondary:hover{
			  background-color: #FFF;
			  color: var(--main-blue);
			}
			.simptoms-recommendations{
			  display: flex;
			  flex-direction: column;
			  justify-content: flex-start;
			  max-width: 640px;
			}
			.simptoms-recommendations .symptom{
			  border-bottom: 1px solid var(--tint-stone-50);
			  padding: 0 0 32px 0;
			  max-width: 100%;
			  height: auto;
			  margin-bottom: 32px;
			}
			.simptoms-recommendations .symptom.d-none{
			  display: none;
			}
			.simptoms-recommendations .symptom.symptom0{
			  margin-top: 16px;
			}
			.simptoms-recommendations .symptom.alert{

			}
			.simptoms-recommendations .symptom.alert .name,
			.simptoms-recommendations .symptom.alert .description,
			.simptoms-recommendations .symptom.alert a{
			  color: var(--main-pink);
			}
			.simptoms-recommendations .symptom .name{
			  color: var(--main-blue);
			  font-family: "SofiaPro-SemiBold";
			  font-size: 20px;
			  font-style: normal;
			  font-weight: 700;
			  line-height: 30px;
			  letter-spacing: -0.3px;
			  margin: 0 0 16px 0;
			  display: flex;
			  column-gap: 8px;
			  align-items: center;
			  justify-content: flex-start;
			}
			.simptoms-recommendations .symptom .description{
			  color: var(--main-blue);
			  font-family: "SofiaPro-Regular";
			  font-size: 16px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 24px; /* 150% */
			  letter-spacing: -0.16px;
			  margin: 0;
			}
			.simptoms-recommendations .symptom a:not(.button){
			  color: var(--main-blue);
			  font-family: "SofiaPro-Regular";
			  font-size: 16px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 24px; /* 150% */
			  letter-spacing: -0.16px;
			  text-decoration-line: underline;
			  text-decoration-style: initial;
			  text-decoration-skip-ink: none;
			  text-decoration-thickness: auto;
			  text-underline-offset: auto;
			  text-underline-position: left;
			}
			.simptoms-recommendations .symptom a.button{
			  color: var(--main-blue);
			  font-family: "SofiaPro-Medium";
			  font-size: 14px;
			  font-style: normal;
			  font-weight: 500;
			  line-height: 20px;
			  padding: 8px 16px 8px 24px;
			}
			.simptoms-recommendations .symptom a.button.whatsapp{
			  background-color: #25D366;
			  color: #FFF;
			  border-color: #25D366;
			  padding: 8px 16px;
			}
			.simptoms-recommendations .symptom a.button svg{
			  width: 16px;
			  height: 16px;
			}
			.simptoms-recommendations .symptom a.button span{
			  position: relative;
			  top: -1px;
			}
			.meno-score-container .box#whats_next{
			  background-color: var(--main-blue);
			}
			.meno-score-container .box{
			  border: 1px solid var(--secondary-blue-20);
			  border-radius: 16px;
			  padding: 32px;
			  display: flex;
			  flex-direction: row;
			  column-gap: 64px;
			  align-items: flex-start;
			}
			.meno-score-container .box .title{
			  color: var(--main-blue);
			  font-family: "SofiaPro-Medium";
			  font-size: 24px;
			  font-style: normal;
			  font-weight: 500;
			  line-height: 32px; /* 133.333% */
			  letter-spacing: -0.72px;
			  margin: 0 0 24px 0;
			  width: 100%;
			  max-width: 320px;
			}
			.meno-score-container .box#whats_next .title{
			  color: #FFF;
			}
			.meno-score-container .box .description{
			  color: var(--secondary-blue-80);
			  font-family: "SofiaPro-Regular";
			  font-size: 16px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 24px; /* 150% */
			  letter-spacing: -0.16px;
			}
			.meno-score-container .box#whats_next .description ul{
			  color: #FFF;
			  background-color: transparent;
			  border: 0;
			  margin: 0;
			}
			.meno-score-container .box#whats_next .description ul li{
			  background-color: transparent;
			  padding: 0 0 0 28px;
			  font-family: "SofiaPro-Regular";
			  font-size: 16px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 24px; /* 150% */
			  letter-spacing: -0.16px;
			  margin-bottom: 4px;
			  background-image: none;
			  background-repeat: no-repeat;
			  background-position: top 3px left;
			}
			a.button.whatsapp{
			  background-color: #25D366;
			  color: #FFF;
			  border-color: #25D366;
			  padding: 8px 16px;
			  font-family: 'SofiaPro-Medium';
			  font-size: 14px;
			  font-style: normal;
			  font-weight: 500;
			  line-height: 20px;
			  gap: 8px;
			  border-radius: 48px;
			  display: flex;
			  text-decoration: none;
			  align-items: center;
			}
			.button.button--secondary{
				display: inline-flex;
				justify-content: center;
				align-items: center;
				padding: 0 24px;
				cursor: pointer;
				font: inherit;
				text-decoration: none;
				font-family: 'SofiaPro-Medium';
				font-weight: 500;
				appearance: none;
				letter-spacing: -.24px;
				border-radius: 48px;
				gap: 6px;
				background-color: #FFF;
				border: 1px solid #3D497A;
				color: #3D497A;
				transition: background-color 0.3s ease;
				font-size: 14px;
				line-height: 20px;
			}
			.meno-score-container .box#whats_next .description ul li:last-child{
			  margin-bottom: 0;
			}
			.meno-score-container .box .actions{
			  display: flex;
			  column-gap: 8px;
			  margin-top: 24px;
			  flex-wrap: wrap;
			  row-gap: 16px;
			}
			.meno-score-container .box .info-box{
			  padding: 24px;
			  background-color: #F5F6F8;
			  border-radius: 16px;
			  min-width: 192px;
			}
			.meno-score-container .box .info-box .stats{
			  color: var(--main-blue);
			  font-family: "SofiaPro-SemiBold";
			  font-size: 24px;
			  font-style: normal;
			  font-weight: 700;
			  line-height: 32px; /* 133.333% */
			  letter-spacing: -0.96px;
			  margin: 0 0 8px 0;
			}
			.meno-score-container .box .info-box .stats-desc{
			  color: var(--main-blue);
			  font-family: "SofiaPro-Regular";
			  font-size: 14px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 20px; /* 142.857% */
			  letter-spacing: -0.42px;
			}
			.meno-score-container .box .info-box-dr{
			  width: 240px;
			  border-radius: 24px;
			}
			.meno-score-container .box .info-box-dr>img{
			  width: 100%;
			  min-width: 240px;
			  border-radius: 24px 24px 0 0;
			  display: block;
			}
			.meno-score-container .box .info-box-dr .dr-info{
			  padding: 24px;
			  background-color: #F5F6F8;
			  border-radius: 0 0 24px 24px;
			}
			.meno-score-container .box .info-box-dr .dr-info .dr-name{
			  color: var(--main-blue);
			  font-family: "SofiaPro-SemiBold";
			  font-size: 18px;
			  font-style: normal;
			  font-weight: 700;
			  line-height: 28px; /* 155.556% */
			  letter-spacing: -0.54px;
			  margin: 0 0 8px 0;
			}
			.meno-score-container .box .info-box-dr .dr-info .dr-desc{
			  color: var(--main-blue);
			  font-family: "SofiaPro-Regular";
			  font-size: 14px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 20px; /* 142.857% */
			  letter-spacing: -0.42px;
			}
			.meno-score-container .box .button{
			  padding: 8px 16px;
			  font-family: "SofiaPro-Regular";
			  font-size: 14px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 20px; /* 142.857% */
			  letter-spacing: -0.42px;
			}
			.results .topic-header{
			  display: none;
			}
			.results{
			  width: 100%;
			  max-width: 1120px;
			  padding: 0 40px;
			}
			.pdf-banner{
				margin-bottom: 60px;
				width: 100%;
			}
			.content-container{
				display: flex;
				justify-content: space-between;
			}
			.sidebar{
				width: 320px;
				padding: 0 0 0 60px;
			}
			.dashboardMenu{
				display: flex;
				flex-direction: column;
				flex-wrap: wrap;
				row-gap: 12px;
			}
			.menuLink{
				color: #949494;
				font-size: 16px;
				font-style: normal;
				font-weight: 500;
				line-height: 24px;
				letter-spacing: -0.48px;
				font-family: "SofiaPro-Medium";
				letter-spacing: -0.24px;
				background-color: transparent;
				border: 0;
				padding: 0;
				text-align: left;
				outline: none;
			}
			.sidebar-summary{
				font-family: "SofiaPro-SemiBold";
				color: #333;
				font-size: 18px;
				font-style: normal;
				font-weight: 700;
				line-height: 28px; /* 155.556% */
				letter-spacing: -0.54px;
				margin: 0 0 16px 0;
			}
		</style>
	</head>
	<body>
		<div class="results">
			<img src="{{PDF_BANNER_SRC}}" width="100%" height="auto" class="pdf-banner"/>
			<div class="content-container">
				<div class="sidebar">
					<p class="sidebar-summary">{{PDF_SIDEBAR_SUMMARY}}</p>
					<div class="dashboardMenu">
						<button class="menuLink">{{PDF_STAGE_LABEL}}</button>
						<button class="menuLink">{{PDF_SCORE_LABEL}}</button>
						<button class="menuLink">{{PDF_SYMPTOMS_LABEL}}</button>
						<button class="menuLink">{{WHATS_NEXT_SIDEBAR}}</button>
						<button class="menuLink">{{BOOK_CALL_SIDEBAR}}</button>
					</div>
				</div>
				<div class="meno-score-container">
			   <img src="{{STAGE_IMAGE_URL}}" width="100%" class="meno-stage" />
			   <div class="meno-stage" id="{{PDF_STAGE_LABEL}}">
			      <div class="meno-stage-main-content">
			         <div class="meno-stage-text">
			            <div class="meno-stage-prehead">{{PDF_STAGE_LABEL}}</div>
			            <div class="meno-stage-title">{{STAGE}}</div>
			            <div class="meno-stage-description">
							{{STAGE_DESCRIPTION}}
			            </div>
			         </div>
			      </div>
			   </div>
			   <div class="meno-score" id="{{PDF_SCORE_LABEL}}">
			      <svg width="128" height="128" viewBox="0 0 128 128" class="score-circle">
			         <circle cx="64" cy="64" r="60" fill="white" stroke="#D8DBE4" stroke-width="8"></circle>
			         <circle cx="64" cy="64" r="60" fill="none" stroke="#3D497A" stroke-width="8" stroke-dasharray="376.99111843077515" stroke-dashoffset="{{SCORE_PROGRESS}}" stroke-linecap="round" transform="rotate(90 64 64)" style="transition: stroke-dashoffset 1500ms ease-in-out 300ms;"></circle>
			         <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-size="36" fill="#3D497A">{{SCORE}}</text>
			         <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="#3D497A">{{MY_SCORE_LABEL}}</text>
			      </svg>
			      <div class="meno-stage-main-content">
			         <div class="meno-stage-text">
			            <div class="meno-stage-prehead">{{PDF_SCORE_LABEL}}</div>
			            <div class="meno-stage-title">{{SCORENAME}}</div>
			            <div class="meno-stage-description">
							{{SCORE_DESCRIPTION}}
			            </div>
			         </div>
			      </div>
			      <div class="meno-stage-stats">
			         <div class="percent">{{STAGE_PERCENTAGE}}</div>
			         <div class="text">{{STAGE_INSIGHTS}}</div>
			      </div>
			   </div>
			   <div class="simptoms-recommendations" id="symptoms">
			      <div class="symptoms-prehead">{{PDF_SYMPTOMS_LABEL}}</div>
			      <div class="intro">
			         <h2>{{SYMPTOMS_TITLE}}</h2>
			         <div class="intro-text">{{SYMPTOMS_INTRO}}</div>
			      </div>
				  {{SYMPTOMS_SECTION}}
			   </div>
			</div>
			</div>
    </div>
	</body>
</html>`;
