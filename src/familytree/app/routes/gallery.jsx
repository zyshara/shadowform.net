import { useNavigate, useSearchParams } from 'react-router';
import family from '../../data/family.json';
import collection from '../../data/photos.json';
import { photoTags } from '../../photos.js';
import ArchiveHeader from '../../components/ArchiveHeader.jsx';
import PhotoGallery from '../../components/PhotoGallery.jsx';
import '../../gallery.css';
export default function Gallery() {
 const [params,setParams]=useSearchParams(); const navigate=useNavigate();
 const photos=collection.filter((p,i)=>p?.src && collection.findIndex(other=>other.src===p.src)===i);
 const person=params.getAll('person').join('|'), tag=params.get('tag')||'', query=params.get('q')||'';
 const selectedIds=[...new Set(params.getAll('person'))];
 const selectedPeople=family.people.filter(p=>selectedIds.includes(p.id));
 const matches=family.people.filter(p=>!selectedIds.includes(p.id)&&photos.some(photo=>photo.people?.includes(p.id))&&p.name.toLowerCase().includes(query.toLowerCase()));
 function selectPerson(id,remove=false){const next=new URLSearchParams(params);next.delete('person');next.delete('q');next.delete('photo');const ids=remove?selectedIds.filter(value=>value!==id):[...new Set([...selectedIds,id])];ids.forEach(value=>next.append('person',value));setParams(next);}
 const visible=photos.filter(p=>selectedIds.every(id=>p.people?.includes(id))&&(!tag||photoTags(p).includes(tag))&&(!query||[p.caption,p.description,...photoTags(p),...family.people.filter(person=>p.people?.includes(person.id)).map(person=>person.name)].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase())));
 return <main className="archive-gallery"><ArchiveHeader mode="photos" query={query} onQuery={value=>{const next=new URLSearchParams(params);next.delete('photo');if(value)next.set('q',value);else next.delete('q');setParams(next,{replace:true});}} count={photos.length} selectedPeople={selectedPeople} onRemovePerson={id=>selectPerson(id,true)} results={matches.map(p=>({id:p.id,label:p.name,image:p.photo}))} onSelect={p=>selectPerson(p.id)}/><div className="gallery-content" tabIndex={-1}><div className="gallery-heading"><h1>Photographs</h1><span role="status">{visible.length}{person||tag||query?` of ${photos.length}`:''} {visible.length===1?'photograph':'photographs'}</span>{(person||tag||query)&&<button className="search-clear" onClick={()=>setParams({})}>Clear search</button>}</div>
 {visible.length ? <PhotoGallery key={[person,tag,query].join("|")} activePhotoId={params.get("photo")} onPhotoChange={(id,replace=false)=>{const next=new URLSearchParams(params);if(id)next.set("photo",id);else next.delete("photo");setParams(next,{replace});}} full photos={visible} allPhotos={photos} people={family.people} name="the family archive" onNavigate={p=>navigate(`/?person=${encodeURIComponent(p.id)}`)} onTag={value=>setParams({tag:value})}/> : <p className="record-empty">No photographs match these filters.</p>}
 </div></main>;
}
