# Original background music for the Shorts, synthesised from scratch (free to use). Args: A B END out.wav
import numpy as np, wave, sys
A,B,END=map(float,sys.argv[1:4]); OUTF=sys.argv[4]
SR=44100; N=int(SR*(END+.5)); L=np.zeros(N); R=np.zeros(N)
def m(n): return 440*2**((n-69)/12)
def put(t0,sig,g=1.,pan=0.):
    i=int(t0*SR); sig=sig[:max(0,N-i)]*g
    L[i:i+len(sig)]+=sig*np.sqrt((1-pan)/2)*1.414; R[i:i+len(sig)]+=sig*np.sqrt((1+pan)/2)*1.414
def pad(notes,dur,att=1.,rel=1.2,br=.25):
    n=int((dur+rel)*SR); t=np.arange(n)/SR; x=np.zeros(n)
    for k in notes:
        for d in (-.1,0,.1):
            f=m(k)*2**(d/12); x+=np.sin(2*np.pi*f*t)+br*np.sin(4*np.pi*f*t)
    return x*np.minimum(1,t/att)*np.where(t<dur,1,np.exp(-(t-dur)/(rel/3)))/(len(notes)*3)
def piano(k,d=1.1):
    n=int(d*SR); t=np.arange(n)/SR; f=m(k)
    return sum(np.sin(2*np.pi*f*h*t)*np.exp(-t*(1.5+h))/h for h in (1,2,3,4))*np.minimum(1,t/.004)
def bell(k,d=2.5):
    n=int(d*SR); t=np.arange(n)/SR; f=m(k)
    return (np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*f*2.76*t)*np.exp(-t/.3))*np.exp(-t/.9)
def kick():
    n=int(.45*SR); t=np.arange(n)/SR; f=40+70*np.exp(-t/.04); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/.22)
# worry: A minor, slow piano
put(0,pad([45,52,57,60],A,att=1.5,br=.12),.5)
for i,k in enumerate([69,72,76,72,69,72,76,79]):
    if i*.55<A-.3: put(.2+i*.55,piano(k),.10,pan=.3 if i%2 else -.3)
for k,d in [(84,0),(88,.08),(91,.16)]: put(A+.3+d,bell(k,3),.12)
prog=[([48,55,60,64],[60,64,67,72]),([43,55,59,62],[59,62,67,71]),([45,57,60,64],[60,64,69,72]),([41,57,60,65],[60,65,69,72])]
BAR=2.0; t=A+.3; b=0
while t<END-1:
    lo,ar=prog[b%4]; put(t,pad(lo,BAR,att=.3,rel=.8,br=.3),.45)
    for j in range(8): put(t+j*BAR/8,piano(ar[[0,1,2,3,2,1,2,3][j]]+(12 if t>B and j%4==3 else 0)),.13,pan=.3 if j%2 else -.3)
    if t>=A+2:
        for j in range(4): put(t+j*BAR/4,kick(),.3)
    t+=BAR; b+=1
put(B,kick(),.6)
for k,d in [(72,0),(76,.12),(79,.24),(84,.36)]: put(B+d,bell(k,3),.11)
x=np.stack([L,R],1); x=x/np.max(np.abs(x))*.85; fs=int((END-1.2)*SR); x[fs:]*=np.linspace(1,0,len(x)-fs)[:,None]
with wave.open(OUTF,'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype('<i2').tobytes())
