import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para TypeScript
export interface Trip {
  id: string
  start_date: string
  end_date: string
  flight_info?: string
  hotel_name?: string
  hotel_reservation?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Park {
  id: string
  name: string
  icon?: string
  color: string
  created_at: string
  lands?: Land[]
}

export interface Land {
  id: string
  park_id: string
  name: string
  description?: string
  icon?: string
  color: string
  created_at: string
  attractions?: Attraction[]
}

export interface Attraction {
  id: string
  land_id: string
  name: string
  type: "ride" | "show" | "restaurant" | "shop"
  priority: "high" | "medium" | "low"
  notes?: string
  created_at: string
}

// Agregar interfaz para fotos de películas
export interface MoviePhoto {
  id: string
  movie_id: string
  photo_url: string
  photo_path: string
  caption?: string
  uploaded_at: string
}

// Actualizar interfaz Movie para incluir fotos
export interface Movie {
  id: string
  title: string
  year?: number
  watched: boolean
  disney_plus_link?: string
  notes?: string
  rating?: number
  watch_date?: string
  priority: "high" | "medium" | "low"
  imdb_score?: number
  jacqui_rating?: number
  maxi_rating?: number
  created_at: string
  updated_at: string
  tags?: Tag[]
  photos?: MoviePhoto[]
}

export interface Task {
  id: string
  title: string
  description?: string
  due_date?: string
  completed: boolean
  priority: "high" | "medium" | "low"
  created_at: string
  updated_at: string
  tags?: Tag[]
}

export interface Note {
  id: string
  title: string
  content: string
  color: string
  created_at: string
  updated_at: string
  tags?: Tag[]
}

export interface Tag {
  id: string
  name: string
  type: "park" | "land" | "attraction"
  parent_id?: string
  parent_name?: string
  icon?: string
  color?: string
  full_path?: string
  created_at: string
}

// Funciones para Trips
export const getTrip = async () => {
  const { data, error } = await supabase.from("trips").select("*").single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching trip:", error)
    return null
  }

  return data
}

export const upsertTrip = async (tripData: Partial<Trip>) => {
  const { data, error } = await supabase.from("trips").upsert(tripData).select().single()

  if (error) {
    console.error("Error upserting trip:", error)
    throw error
  }

  return data
}

// Funciones para Parks
export const getParks = async () => {
  const { data, error } = await supabase
    .from("parks")
    .select(`
      *,
      lands (
        *,
        attractions (*)
      )
    `)
    .order("created_at")

  if (error) {
    console.error("Error fetching parks:", error)
    throw error
  }

  return data
}

export const createPark = async (parkData: Omit<Park, "id" | "created_at">) => {
  const { data, error } = await supabase.from("parks").insert(parkData).select().single()

  if (error) {
    console.error("Error creating park:", error)
    throw error
  }

  return data
}

export const updatePark = async (id: string, parkData: Partial<Park>) => {
  const { data, error } = await supabase.from("parks").update(parkData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating park:", error)
    throw error
  }

  return data
}

export const deletePark = async (id: string) => {
  const { error } = await supabase.from("parks").delete().eq("id", id)

  if (error) {
    console.error("Error deleting park:", error)
    throw error
  }
}

// Funciones para Lands
export const getLands = async (parkId?: string) => {
  let query = supabase
    .from("lands")
    .select(`
      *,
      attractions (*)
    `)
    .order("created_at")

  if (parkId) {
    query = query.eq("park_id", parkId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching lands:", error)
    throw error
  }

  return data
}

export const createLand = async (landData: Omit<Land, "id" | "created_at">) => {
  const { data, error } = await supabase.from("lands").insert(landData).select().single()

  if (error) {
    console.error("Error creating land:", error)
    throw error
  }

  return data
}

export const updateLand = async (id: string, landData: Partial<Land>) => {
  const { data, error } = await supabase.from("lands").update(landData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating land:", error)
    throw error
  }

  return data
}

export const deleteLand = async (id: string) => {
  const { error } = await supabase.from("lands").delete().eq("id", id)

  if (error) {
    console.error("Error deleting land:", error)
    throw error
  }
}

// Funciones para Attractions
export const createAttraction = async (attractionData: Omit<Attraction, "id" | "created_at">) => {
  const { data, error } = await supabase.from("attractions").insert(attractionData).select().single()

  if (error) {
    console.error("Error creating attraction:", error)
    throw error
  }

  return data
}

export const updateAttraction = async (id: string, attractionData: Partial<Attraction>) => {
  const { data, error } = await supabase.from("attractions").update(attractionData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating attraction:", error)
    throw error
  }

  return data
}

export const deleteAttraction = async (id: string) => {
  const { error } = await supabase.from("attractions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting attraction:", error)
    throw error
  }
}

// Funciones para Tags (usando la nueva arquitectura con lands)
export const getTagsGrouped = async () => {
  const { data, error } = await supabase.rpc("get_unified_tags_grouped")

  if (error) {
    console.error("Error fetching grouped tags:", error)
    throw error
  }

  // Transform the data into the expected format with 3-level hierarchy
  const grouped: { [key: string]: Tag[] } = {}

  data?.forEach((row: any) => {
    const parkId = row.park_id

    // Add park if not exists
    if (!grouped[parkId]) {
      grouped[parkId] = [
        {
          id: row.park_id,
          name: row.park_name,
          type: "park" as const,
          icon: row.park_icon,
          color: row.park_color,
          full_path: row.park_name,
          created_at: new Date().toISOString(),
        },
      ]
    }

    // Add land if exists and not already added
    if (row.land_id) {
      const landExists = grouped[parkId].some(tag => tag.id === row.land_id && tag.type === "land")
      if (!landExists) {
        grouped[parkId].push({
          id: row.land_id,
          name: row.land_name,
          type: "land" as const,
          parent_id: row.park_id,
          parent_name: row.park_name,
          icon: row.land_icon,
          color: row.land_color,
          full_path: `${row.park_name} → ${row.land_name}`,
          created_at: new Date().toISOString(),
        })
      }
    }

    // Add attraction if exists
    if (row.attraction_id) {
      grouped[parkId].push({
        id: row.attraction_id,
        name: row.attraction_name,
        type: "attraction" as const,
        parent_id: row.land_id,
        parent_name: row.land_name,
        icon: row.attraction_icon,
        color: row.attraction_color,
        full_path: `${row.park_name} → ${row.land_name} → ${row.attraction_name}`,
        created_at: new Date().toISOString(),
      })
    }
  })

  return grouped
}

// Funciones para Movies (VERSIÓN OPTIMIZADA con RPC)
export const getMovies = async (options: { includeTags?: boolean; includePhotos?: boolean } = {}) => {
  const { includeTags = true, includePhotos = true } = options

  const { data: movies, error } = await supabase.from("movies").select("*").order("created_at")

  if (error) {
    console.error("Error fetching movies:", error)
    throw error
  }

  if (!movies || movies.length === 0) {
    return []
  }

  // Si no se necesitan tags ni fotos, retornar directamente
  if (!includeTags && !includePhotos) {
    return movies.map(movie => ({
      ...movie,
      tags: [],
      photos: [],
    }))
  }

  const movieIds = movies.map(movie => movie.id)

  // Ejecutar todas las consultas en paralelo - usando async functions para garantizar Promise correcto
  const promises: Promise<any>[] = []

  // Fotos (si se necesitan)
  if (includePhotos) {
    promises.push(
      (async () => {
        return await supabase
          .from("movie_photos")
          .select("*")
          .in("movie_id", movieIds)
          .order("uploaded_at", { ascending: false })
      })(),
    )
  } else {
    promises.push(Promise.resolve({ data: [] }))
  }

  // Tags (si se necesitan) - UNA SOLA LLAMADA RPC
  if (includeTags) {
    promises.push(
      (async () => {
        return await supabase.rpc("get_multiple_movie_tags", { movie_ids_param: movieIds })
      })(),
    )
  } else {
    promises.push(Promise.resolve({ data: [] }))
  }

  // Ejecutar todas las consultas en paralelo
  const [photosResult, tagsResult] = await Promise.all(promises)

  // Procesar fotos
  const allPhotos: Record<string, any[]> = {}
  if (includePhotos && photosResult.data) {
    photosResult.data.forEach((photo: any) => {
      if (!allPhotos[photo.movie_id]) {
        allPhotos[photo.movie_id] = []
      }
      allPhotos[photo.movie_id].push(photo)
    })
  }

  // Procesar tags (ya vienen procesados del RPC)
  const allTags: Record<string, any[]> = {}
  if (includeTags && tagsResult.data) {
    tagsResult.data.forEach((tag: any) => {
      if (!allTags[tag.movie_id]) {
        allTags[tag.movie_id] = []
      }
      allTags[tag.movie_id].push({
        id: tag.id,
        name: tag.name,
        type: tag.type,
        parent_id: tag.parent_id,
        parent_name: tag.parent_name,
        icon: tag.icon,
        color: tag.color,
        full_path: tag.full_path,
        created_at: new Date().toISOString(),
      })
    })
  }

  // Combinar todo
  return movies.map(movie => ({
    ...movie,
    tags: allTags[movie.id] || [],
    photos: allPhotos[movie.id] || [],
  }))
}

export const createMovie = async (movieData: Omit<Movie, "id" | "created_at" | "updated_at">) => {
  const { data, error } = await supabase.from("movies").insert(movieData).select().single()

  if (error) {
    console.error("Error creating movie:", error)
    throw error
  }

  return data
}

export const updateMovie = async (id: string, movieData: Partial<Movie>) => {
  const { data, error } = await supabase
    .from("movies")
    .update({ ...movieData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating movie:", error)
    throw error
  }

  return data
}

export const deleteMovie = async (id: string) => {
  const { error } = await supabase.from("movies").delete().eq("id", id)

  if (error) {
    console.error("Error deleting movie:", error)
    throw error
  }
}

// Actualizar la función uploadMoviePhoto para mejor manejo de errores y verificación del bucket

// Función para verificar/crear el bucket
export const ensureMoviePhotosBucket = async () => {
  try {
    // Primero intentar hacer una operación simple en el bucket para verificar si existe
    const { data: testFiles, error: testError } = await supabase.storage.from("movie-photos").list("", { limit: 1 })

    // Si no hay error, el bucket existe y funciona
    if (!testError) {
      console.log("Bucket 'movie-photos' ya existe y está funcionando")
      return true
    }

    // Si el error es "Bucket not found", intentar crear el bucket
    if (testError.message.includes("Bucket not found")) {
      console.log("Bucket no encontrado, intentando crear...")

      const { data: newBucket, error: createError } = await supabase.storage.createBucket("movie-photos", {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        fileSizeLimit: 10485760, // 10MB
      })

      if (createError) {
        console.error("Error creating bucket:", createError)

        // Si el error es que ya existe, eso está bien
        if (createError.message.includes("already exists") || createError.message.includes("duplicate")) {
          console.log("El bucket ya existe, continuando...")
          return true
        }

        throw new Error(
          "No se pudo crear el almacenamiento de fotos. El bucket 'movie-photos' debe ser creado manualmente en Supabase Storage con permisos públicos.",
        )
      }

      console.log("Bucket 'movie-photos' creado exitosamente")
      return true
    }

    // Para cualquier otro error, asumir que el bucket existe pero hay problemas de permisos
    console.warn("Advertencia al verificar bucket:", testError.message)
    console.log("Asumiendo que el bucket existe, continuando...")
    return true
  } catch (error) {
    console.error("Error ensuring bucket:", error)

    // Si llegamos aquí, probablemente el bucket existe pero hay problemas de configuración
    console.log("Asumiendo que el bucket existe, continuando con la subida...")
    return true
  }
}

// Actualizar la función uploadMoviePhoto
export const uploadMoviePhoto = async (movieId: string, file: File, caption?: string) => {
  try {
    // Verificar que el archivo sea una imagen
    if (!file.type.startsWith("image/")) {
      throw new Error("Solo se permiten archivos de imagen")
    }

    // Verificar tamaño del archivo (10MB máximo)
    if (file.size > 10485760) {
      throw new Error("El archivo es demasiado grande. Máximo 10MB permitido.")
    }

    // Verificar/crear el bucket
    await ensureMoviePhotosBucket()

    // Generate unique filename
    const fileExt = file.name.split(".").pop()?.toLowerCase()
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileName = `${movieId}/${timestamp}_${randomString}.${fileExt}`
    const filePath = `movie-photos/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("movie-photos")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading photo:", uploadError)

      // Mensajes de error más específicos
      if (uploadError.message.includes("Bucket not found")) {
        throw new Error(
          "El almacenamiento de fotos no está configurado. Por favor, crea el bucket 'movie-photos' en Supabase Storage.",
        )
      } else if (uploadError.message.includes("File size too large")) {
        throw new Error("El archivo es demasiado grande. Máximo 10MB permitido.")
      } else if (uploadError.message.includes("Invalid file type")) {
        throw new Error("Tipo de archivo no válido. Solo se permiten imágenes.")
      } else {
        throw new Error(`Error al subir la foto: ${uploadError.message}`)
      }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("movie-photos").getPublicUrl(fileName)

    // Verificar que la URL sea válida
    if (!publicUrl) {
      throw new Error("No se pudo generar la URL pública de la foto")
    }

    // Save photo record to database
    const { data: photoData, error: dbError } = await supabase
      .from("movie_photos")
      .insert({
        movie_id: movieId,
        photo_url: publicUrl,
        photo_path: fileName, // Guardar solo el nombre del archivo, no la ruta completa
        caption: caption || null,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Error saving photo to database:", dbError)

      // Intentar limpiar el archivo subido si falla la base de datos
      try {
        await supabase.storage.from("movie-photos").remove([fileName])
      } catch (cleanupError) {
        console.error("Error cleaning up uploaded file:", cleanupError)
      }

      throw new Error("Error al guardar la información de la foto en la base de datos")
    }

    return photoData
  } catch (error) {
    console.error("Error in uploadMoviePhoto:", error)
    throw error
  }
}

// Actualizar la función deleteMoviePhoto
export const deleteMoviePhoto = async (photoId: string) => {
  try {
    // Get photo data first
    const { data: photo, error: fetchError } = await supabase
      .from("movie_photos")
      .select("photo_path")
      .eq("id", photoId)
      .single()

    if (fetchError) {
      console.error("Error fetching photo:", fetchError)
      throw new Error("No se pudo encontrar la información de la foto")
    }

    if (!photo) {
      throw new Error("Foto no encontrada")
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage.from("movie-photos").remove([photo.photo_path])

    if (storageError) {
      console.error("Error deleting from storage:", storageError)
      // Continue anyway to clean up database
    }

    // Delete from database
    const { error: dbError } = await supabase.from("movie_photos").delete().eq("id", photoId)

    if (dbError) {
      console.error("Error deleting photo from database:", dbError)
      throw new Error("Error al eliminar la foto de la base de datos")
    }

    return true
  } catch (error) {
    console.error("Error in deleteMoviePhoto:", error)
    throw error
  }
}

export const updateMoviePhotoCaption = async (photoId: string, caption: string) => {
  const { data, error } = await supabase.from("movie_photos").update({ caption }).eq("id", photoId).select().single()

  if (error) {
    console.error("Error updating photo caption:", error)
    throw error
  }

  return data
}

// Funciones para Movie Tags (nueva arquitectura con lands)
export const updateMovieTags = async (movieId: string, tagIds: string[]) => {
  // Separate park IDs, land IDs, and attraction IDs
  const { data: allTags } = await supabase.from("unified_tags").select("*")
  const parkIds = tagIds.filter((id) => allTags?.find((tag) => tag.id === id && tag.type === "park"))
  const landIds = tagIds.filter((id) => allTags?.find((tag) => tag.id === id && tag.type === "land"))
  const attractionIds = tagIds.filter((id) => allTags?.find((tag) => tag.id === id && tag.type === "attraction"))

  // Delete existing tags
  await supabase.from("movie_park_tags").delete().eq("movie_id", movieId)
  await supabase.from("movie_land_tags").delete().eq("movie_id", movieId)
  await supabase.from("movie_attraction_tags").delete().eq("movie_id", movieId)

  // Insert new park tags
  if (parkIds.length > 0) {
    const { error: parkError } = await supabase
      .from("movie_park_tags")
      .insert(parkIds.map((parkId) => ({ movie_id: movieId, park_id: parkId })))

    if (parkError) {
      console.error("Error updating movie park tags:", parkError)
      throw parkError
    }
  }

  // Insert new land tags
  if (landIds.length > 0) {
    const { error: landError } = await supabase
      .from("movie_land_tags")
      .insert(landIds.map((landId) => ({ movie_id: movieId, land_id: landId })))

    if (landError) {
      console.error("Error updating movie land tags:", landError)
      throw landError
    }
  }

  // Insert new attraction tags
  if (attractionIds.length > 0) {
    const { error: attractionError } = await supabase
      .from("movie_attraction_tags")
      .insert(attractionIds.map((attractionId) => ({ movie_id: movieId, attraction_id: attractionId })))

    if (attractionError) {
      console.error("Error updating movie attraction tags:", attractionError)
      throw attractionError
    }
  }
}

// Funciones para Tasks (VERSIÓN OPTIMIZADA con RPC)
export const getTasks = async (options: { includeTags?: boolean } = {}) => {
  const { includeTags = true } = options

  const { data: tasks, error } = await supabase.from("tasks").select("*").order("due_date", { nullsFirst: false })

  if (error) {
    console.error("Error fetching tasks:", error)
    throw error
  }

  if (!tasks || tasks.length === 0) {
    return []
  }

  // Si no se necesitan tags, retornar directamente
  if (!includeTags) {
    return tasks.map(task => ({
      ...task,
      tags: [],
    }))
  }

  const taskIds = tasks.map(task => task.id)

  // Obtener todas las tags usando RPC optimizado
  const { data: tagsData } = await supabase.rpc("get_multiple_task_tags", { task_ids_param: taskIds })

  // Procesar tags (ya vienen procesados del RPC)
  const allTags: Record<string, any[]> = {}
  if (tagsData) {
    tagsData.forEach((tag: any) => {
      if (!allTags[tag.task_id]) {
        allTags[tag.task_id] = []
      }
      allTags[tag.task_id].push({
        id: tag.id,
        name: tag.name,
        type: tag.type,
        parent_id: tag.parent_id,
        parent_name: tag.parent_name,
        icon: tag.icon,
        color: tag.color,
        full_path: tag.full_path,
        created_at: new Date().toISOString(),
      })
    })
  }

  // Combinar todo
  return tasks.map(task => ({
    ...task,
    tags: allTags[task.id] || [],
  }))
}

export const createTask = async (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
  const { data, error } = await supabase.from("tasks").insert(taskData).select().single()

  if (error) {
    console.error("Error creating task:", error)
    throw error
  }

  return data
}

export const updateTask = async (id: string, taskData: Partial<Task>) => {
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...taskData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating task:", error)
    throw error
  }

  return data
}

export const deleteTask = async (id: string) => {
  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) {
    console.error("Error deleting task:", error)
    throw error
  }
}

// Funciones para Task Tags (nueva arquitectura con lands)
export const updateTaskTags = async (taskId: string, tagIds: string[]) => {
  // Separate park IDs, land IDs, and attraction IDs
  const { data: allTags } = await supabase.from("unified_tags").select("*")
  const parkIds = tagIds.filter((id) => allTags?.find((tag) => tag.id === id && tag.type === "park"))
  const landIds = tagIds.filter((id) => allTags?.find((tag) => tag.id === id && tag.type === "land"))
  const attractionIds = tagIds.filter((id) => allTags?.find((tag) => tag.id === id && tag.type === "attraction"))

  // Delete existing tags
  await supabase.from("task_park_tags").delete().eq("task_id", taskId)
  await supabase.from("task_land_tags").delete().eq("task_id", taskId)
  await supabase.from("task_attraction_tags").delete().eq("task_id", taskId)

  // Insert new park tags
  if (parkIds.length > 0) {
    const { error: parkError } = await supabase
      .from("task_park_tags")
      .insert(parkIds.map((parkId) => ({ task_id: taskId, park_id: parkId })))

    if (parkError) {
      console.error("Error updating task park tags:", parkError)
      throw parkError
    }
  }

  // Insert new land tags
  if (landIds.length > 0) {
    const { error: landError } = await supabase
      .from("task_land_tags")
      .insert(landIds.map((landId) => ({ task_id: taskId, land_id: landId })))

    if (landError) {
      console.error("Error updating task land tags:", landError)
      throw landError
    }
  }

  // Insert new attraction tags
  if (attractionIds.length > 0) {
    const { error: attractionError } = await supabase
      .from("task_attraction_tags")
      .insert(attractionIds.map((attractionId) => ({ task_id: taskId, attraction_id: attractionId })))

    if (attractionError) {
      console.error("Error updating task attraction tags:", attractionError)
      throw attractionError
    }
  }
}

// Funciones para Notes (VERSIÓN OPTIMIZADA con RPC)
export const getNotes = async (options: { includeTags?: boolean } = {}) => {
  const { includeTags = true } = options

  const { data: notes, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching notes:", error)
    throw error
  }

  if (!notes || notes.length === 0) {
    return []
  }

  // Si no se necesitan tags, retornar directamente
  if (!includeTags) {
    return notes.map(note => ({
      ...note,
      tags: [],
    }))
  }

  const noteIds = notes.map(note => note.id)

  // Obtener todas las tags usando RPC optimizado
  const { data: tagsData } = await supabase.rpc("get_multiple_note_tags", { note_ids_param: noteIds })

  // Procesar tags (ya vienen procesados del RPC)
  const allTags: Record<string, any[]> = {}
  if (tagsData) {
    tagsData.forEach((tag: any) => {
      if (!allTags[tag.note_id]) {
        allTags[tag.note_id] = []
      }
      allTags[tag.note_id].push({
        id: tag.id,
        name: tag.name,
        type: tag.type,
        parent_id: tag.parent_id,
        parent_name: tag.parent_name,
        icon: tag.icon,
        color: tag.color,
        full_path: tag.full_path,
        created_at: new Date().toISOString(),
      })
    })
  }

  // Combinar todo
  return notes.map(note => ({
    ...note,
    tags: allTags[note.id] || [],
  }))
}

export const createNote = async (noteData: Omit<Note, "id" | "created_at" | "updated_at">) => {
  const { data, error } = await supabase.from("notes").insert(noteData).select().single()

  if (error) {
    console.error("Error creating note:", error)
    throw error
  }

  return data
}

export const updateNote = async (id: string, noteData: Partial<Note>) => {
  const { data, error } = await supabase
    .from("notes")
    .update({ ...noteData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating note:", error)
    throw error
  }

  return data
}

export const deleteNote = async (id: string) => {
  const { error } = await supabase.from("notes").delete().eq("id", id)

  if (error) {
    console.error("Error deleting note:", error)
    throw error
  }
}

// Funciones para Note Tags (nueva arquitectura con lands)
export const updateNoteTags = async (noteId: string, tagIds: string[]) => {
  // Separate park IDs, land IDs, and attraction IDs
  const { data: allTags } = await supabase.from("unified_tags").select("*")
  const parkIds = tagIds.filter((id) => allTags?.find((tag) => tag.id === id && tag.type === "park"))
  const landIds = tagIds.filter((id) => allTags?.find((tag) => tag.id === id && tag.type === "land"))
  const attractionIds = tagIds.filter((id) => allTags?.find((tag) => tag.id === id && tag.type === "attraction"))

  // Delete existing tags
  await supabase.from("note_park_tags").delete().eq("note_id", noteId)
  await supabase.from("note_land_tags").delete().eq("note_id", noteId)
  await supabase.from("note_attraction_tags").delete().eq("note_id", noteId)

  // Insert new park tags
  if (parkIds.length > 0) {
    const { error: parkError } = await supabase
      .from("note_park_tags")
      .insert(parkIds.map((parkId) => ({ note_id: noteId, park_id: parkId })))

    if (parkError) {
      console.error("Error updating note park tags:", parkError)
      throw parkError
    }
  }

  // Insert new land tags
  if (landIds.length > 0) {
    const { error: landError } = await supabase
      .from("note_land_tags")
      .insert(landIds.map((landId) => ({ note_id: noteId, land_id: landId })))

    if (landError) {
      console.error("Error updating note land tags:", landError)
      throw landError
    }
  }

  // Insert new attraction tags
  if (attractionIds.length > 0) {
    const { error: attractionError } = await supabase
      .from("note_attraction_tags")
      .insert(attractionIds.map((attractionId) => ({ note_id: noteId, attraction_id: attractionId })))

    if (attractionError) {
      console.error("Error updating note attraction tags:", attractionError)
      throw attractionError
    }
  }
}
