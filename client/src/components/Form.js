import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Form = ({ isOpen, setIsOpen }) => {
  const [formData, setFormData] = useState({ title: "", content: "" });
  const queryClient = useQueryClient();

  const mutation = useMutation(insertNote, {
    onSuccess: () => {
      setFormData({ title: "", content: "" });
    },
  });

  function closeForm(e) {
    e.preventDefault();
    setIsOpen(false);
  }

  async function insertNote() {
    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };
    const res = await fetch("http://localhost:3001/notes", payload);
    if (res?.ok) {
      const row = await res.json();
      if (!row?.success) {
        throw new Error("An error occurred while inerting notes");
      }

      setIsOpen(false);
      queryClient.setQueriesData("notes", (old) => [...old, row.data]);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const {title, content} = formData;
    if(title === '' || content === '') return;
    mutation.mutate();
  }

  return (
    <div
      className={`absolute w-full h-full top-0 left-0 z-50 flex justify-center items-center ${
        !isOpen ? "hidden" : ""
      }`}
    >
      <div className="bg-black opacity-50 absolute w-full h-full top-0 left-0"></div>
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full md:w-1/2 p-5 rounded shadow-md text-gray-800 prose relative"
      >
        <div className="overflow-hidden shadow sm:rounded-md">
          <h2>Add notes</h2>
          {mutation.isError && (
            <span className="block mb-2 text-red-400">
              {mutation.error.message ? mutation.error.message : mutation.error}
            </span>
          )}
          <input
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            placeholder="Add a notes"
            type="text"
            name="title"
            id="title"
            autoComplete="given-name"
            className="rounded-sm w-full border px-2"
          />
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                content: e.target.value,
              }))
            }
            id="about"
            name="about"
            rows="3"
            className="mt-2 rounded-sm w-full border px-2"
            placeholder="contents"
          ></textarea>
          <div className="bg-gray-50 px-1 py-3 text-left">
            <button
              type="submit"
              className="inline-flex mr-2 justify-center rounded-md border border-transparent bg-indigo-600 py-1 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save
            </button>
            <button
              onClick={closeForm}
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-1 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Form;
