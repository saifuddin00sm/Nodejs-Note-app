import React, {useState} from "react";
import {PlusIcon, RefreshIcon } from "@heroicons/react/solid";
import Form from './Form';
import UpdateModal from './UpdateModal';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function Notes() {
const [showForm, setShowForm] = useState(false);
const [updateForm, setUpdateForm] = useState(false);
const [updateId, setUpdateid] = useState('');
const { isLoading, isError, data, error } = useQuery(["notes"], fetchNotes);
const queryClient = useQueryClient();


  const mutation = useMutation(deleteNotes, {
    onSuccess: ()=> queryClient.invalidateQueries('notes')
  });


  async function fetchNotes() {
    try {
      const res = await fetch("http://localhost:3001/notes");
      if (res?.ok) {
        const row = await res.json();
        if (!row?.success) {
          throw new Error("An error occurred while fetching notes");
        }
        console.log(row)
        return row.data;
      }
    } catch (error) {
      console.log(error);
    }
  };

  async function deleteNotes(note){
    try {
      const res = await fetch(`http://localhost:3001/notes/${note.id}`,{method: 'DELETE'});
      if(res?.ok){
        const data = await res.json();
        if(!data.success){
          throw new Error ('An error occurred while deleting notes')
        }
        alert(data.message);
      }
    } catch (error) {
      console.log(error)
    }
  }

  const updateNotes = (note)=> {
    setUpdateid(note);
    setUpdateForm(true);
  }

  return (
    <div className="w-screen overflow-x-hidden bg-red-400 flex flex-col justify-center items-center">
      <div className="mt-3 bg-white w-full md:w-1/2 p-5 text-center rounded shadow-md text-grey-800 prose">
        <h1 className="font-bold">Notes</h1>
        {(isLoading || mutation.isLoading) && (
          <RefreshIcon className="w-10 h-10 animate-spin mx-auto"></RefreshIcon>
        )}
        {(isError || mutation.isError) && (
          <span className="text-red">
            {error.message ? error.message : error}
          </span>
        )}
        {!isLoading && !isError && data && !data.length && (
          <span className="text-red-400">You have no notes</span>
        )}
        {data &&
          data.length > 0 &&
          data.map((note, idx) => (
            <div
              className={`text-left ${
                idx !== data.length - 1 ? "border-b pb-2" : ""
              }`}
              key={note?.id}
            >
              <h2 className="font-medium text-medium">{note.title}</h2>
              <p>{note.content}</p>
              <span>
                <button onClick={()=> mutation.mutate(note)} className="link mr-2 rounded-md border border-transparent bg-red-600 py-1 px-3 mt-2 text-sm font-small text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Delete</button>
                <button onClick={()=> updateNotes(note)} className="link rounded-md border border-transparent bg-indigo-600 py-1 px-3 mt-2 text-sm font-small text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Edit</button>
              </span>
            </div>
          ))}
      </div>
      <button onClick={()=> setShowForm(true)} className="my-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white p-3">
        <PlusIcon className="w-5 h-5"></PlusIcon>
      </button>
      <Form isOpen={showForm} setIsOpen={setShowForm}/>
      <UpdateModal note={updateId} isOpen={updateForm} setIsOpen={setUpdateForm}/>
    </div>
  );
}

export default Notes;
