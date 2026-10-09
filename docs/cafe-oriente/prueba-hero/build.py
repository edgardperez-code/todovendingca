import re, sys, os
SRC=os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../../client/public/cafe-oriente/index.html')
here=os.path.dirname(os.path.abspath(__file__))
out=sys.argv[1]
s=open(SRC,encoding='utf-8').read()
head=s[s.index('<link rel="preconnect"'):s.index('</head>')]
head=re.sub(r'<script type="application/ld\+json">.*?</script>\s*','',head,flags=re.S)
body=s[s.index('<body>')+len('<body>'):s.index('</body>')]
css=open(os.path.join(here,'hero.css'),encoding='utf-8').read()
i=head.rindex('</style>'); head=head[:i]+css+head[i:]
a=body.index('<!-- ================= HERO ANIMADO ================= -->'); b=body.index('</header>',a)+len('</header>')
body=body[:a]+open(os.path.join(here,'hero.html'),encoding='utf-8').read()+body[b:]
a=body.index('// ================= HERO ANIMADO ================='); b=body.index('</script>',a)
body=body[:a]+open(os.path.join(here,'hero.js'),encoding='utf-8').read()+body[b:]
page='<title>Café Oriente · Prueba del hero</title>\n<meta name="robots" content="noindex">\n<meta name="theme-color" content="#3D2314">\n'+head.replace('<meta name="theme-color" content="#3D2314">','')+'\n'+body
page=page.replace('/cafe-oriente/assets/','assets/')
page=re.sub(r'(href|src)="/(?!/)', r'\1="https://www.todovendingca.com/', page)
open(out,'w',encoding='utf-8').write(page)
print(len(page.encode()), 'bytes')
